/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!**************************************!*\
  !*** ./src/main/wallpaper_engine.ts ***!
  \**************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BPMDetector: () => (/* binding */ BPMDetector),
/* harmony export */   PeakDetector: () => (/* binding */ PeakDetector),
/* harmony export */   add_wallpaper_engine_audio_listening: () => (/* binding */ add_wallpaper_engine_audio_listening),
/* harmony export */   set_ui_worker: () => (/* binding */ set_ui_worker)
/* harmony export */ });
class BPMDetector {
    constructor(default_bpm, needed_difference = 0.3, max_bpm = 240) {
        this.kept_entry_count = 50;
        this.p_d = new PeakDetector();
        this.e_values = [];
        this.default_bpm = default_bpm;
        this.needed_difference = needed_difference;
        this.max_bpm = max_bpm;
        this.bpm_changed = false;
    }
    calculate_bpm(time_ms, audio_data, needed_difference = undefined) {
        this.remove_old_entries();
        let large_energy_change;
        if (needed_difference === undefined) {
            large_energy_change = this.p_d.detect_large_energy_changes(audio_data, this.needed_difference);
        }
        else {
            large_energy_change = this.p_d.detect_large_energy_changes(audio_data, needed_difference);
        }
        this.e_values.push({
            is_beat: large_energy_change.is_peak,
            point_in_time_ms: time_ms,
            energy: large_energy_change.value,
        });
        if (this.e_values.length < 2) {
            return this.default_bpm;
        }
        const last_beat = this.get_last_beat();
        if (last_beat == null || !large_energy_change.is_peak) {
            return this.default_bpm;
        }
        const bpm = (1 * 60) / ((time_ms - last_beat.point_in_time_ms) / 1000);
        if (bpm != this.default_bpm) {
            this.bpm_changed = true;
        }
        this.default_bpm = Math.min(bpm, this.max_bpm);
        return Math.min(bpm, this.max_bpm);
    }
    get_last_beat() {
        const ignore_first_beat_count = 1;
        const reversed_values_except_newest = this.e_values
            .slice(ignore_first_beat_count, this.e_values.length - 1)
            .reverse();
        if (this.e_values.length == 0) {
            return null;
        }
        for (const element of reversed_values_except_newest) {
            if (element.is_beat) {
                return { point_in_time_ms: element.point_in_time_ms, energy: element.energy };
            }
        }
        return null;
    }
    remove_old_entries() {
        if (this.e_values.length >= this.kept_entry_count) {
            // const filtered_peaks = this.e_values.filter((values, i, arr) => {
            //     return values.is_beat;
            // });
            let last_beat_index;
            for (const [index, energy_value] of this.e_values.entries()) {
                if (energy_value.is_beat) {
                    last_beat_index = index;
                }
            }
            if (last_beat_index === undefined) {
                last_beat_index = this.e_values.length - 1;
            }
            this.e_values = this.e_values.slice(last_beat_index, this.kept_entry_count);
        }
    }
    get_time_off_next_beat_if_bpm_changed() {
        let last_beat_index = 0;
        if (!this.bpm_changed) {
            return null;
        }
        for (const [index, energy_value] of this.e_values.entries()) {
            if (energy_value.is_beat) {
                last_beat_index = index;
            }
        }
        const e_value = this.e_values[last_beat_index];
        if (e_value !== undefined) {
            const seconds_per_beat = 60 / this.default_bpm;
            return e_value.point_in_time_ms + seconds_per_beat;
        }
        return null;
    }
}
class VolumeNormalizedBPMDetector extends BPMDetector {
    constructor(default_bpm, average_relative_needed_difference = 0.5, max_bpm = 200) {
        super(default_bpm, average_relative_needed_difference, max_bpm);
        this.average_relative_needed_difference = average_relative_needed_difference;
        this.current_audio_average = 0.5;
        this.last_bpms = [];
        this.beat_change_after_seconds = 0.15;
    }
    calculate_bpm(time_ms, audio_data) {
        // Doesn't work great because of internal rms
        const sum = audio_data.reduce((pre, cur_val, ind, arr) => pre + Math.min(cur_val, 1.0));
        const average = (sum + this.current_audio_average) / (audio_data.length + 1);
        const average_with_offset = average + (1 / 10) * this.current_audio_average;
        // TODO try out different normalization
        const audio_data_normalized = audio_data.map((val, i, arr) => val / average_with_offset);
        this.current_audio_average = average_with_offset;
        // const needed_difference =
        //     this.average_relative_needed_difference * this.current_audio_average;
        const bpm = super.calculate_bpm(time_ms, audio_data_normalized, this.average_relative_needed_difference);
        if (this.last_bpms.length <= 0) {
            this.last_bpms.push({ time_ms: time_ms, bpm: bpm });
            return bpm;
        }
        const last_bpm = this.last_bpms[this.last_bpms.length - 1];
        if ((time_ms - last_bpm.time_ms) / 1000 > this.beat_change_after_seconds) {
            this.last_bpms.push({ time_ms: time_ms, bpm: bpm });
        }
        return last_bpm.bpm;
    }
}
class PeakDetector {
    constructor(last_RMS = 0) {
        this.last_RMS = last_RMS;
    }
    detect_large_energy_changes(arr, needed_difference = 0.3) {
        const current_RMS = this.calculate_RootMeanSquare(arr, this.last_RMS);
        console.log("current RMS %f", current_RMS);
        const is_new_rms_peak = current_RMS - needed_difference > this.last_RMS;
        this.last_RMS = current_RMS;
        return { value: current_RMS, is_peak: is_new_rms_peak };
    }
    calculate_RootMeanSquare(arr, last_RMS = 0) {
        const pow_of_2_sum = arr.reduce((p, c, ind, arr) => {
            const normalized_val = Math.min(c, 1.0);
            return p + Math.pow(normalized_val, 2);
        }, 0);
        const rms = Math.sqrt((pow_of_2_sum + last_RMS) / (arr.length + 1));
        return rms;
    }
    find_max_indices(arr, max_threshold = 0.1) {
        if (arr.length == 0) {
            return [];
        }
        // TODO reduce iteration count
        const indexed_peaks = arr.map((v, i, arr) => {
            return { index: i, value: v };
        });
        const indexed_ascending_peaks = indexed_peaks.sort((a, b) => {
            return a.value - b.value;
        });
        const absolute_max = indexed_ascending_peaks.pop();
        const unique_max_in_thresholds = indexed_ascending_peaks.filter((value, ind, arr) => {
            return (absolute_max.value != value.value &&
                absolute_max.value - value.value <= max_threshold);
        });
        unique_max_in_thresholds.push(absolute_max);
        return unique_max_in_thresholds;
    }
}
function isRunningInWallpaperEngine() {
    return typeof window.wallpaper !== undefined;
}
class AudioArrayTool {
    constructor(left_audio_channels, right_audio_channels) {
        this.left_audio_channels = left_audio_channels;
        this.right_audio_channels = right_audio_channels;
    }
    getFromBassLeftAudioChannel(audio_array, channel_count, start_channel = 0) {
        if (channel_count == null) {
            return audio_array.slice(start_channel, this.left_audio_channels);
        }
        else {
            start_channel = Math.min(channel_count, start_channel);
            channel_count = Math.min(Math.max(channel_count, start_channel), this.left_audio_channels);
        }
        const audio_data = audio_array.slice(start_channel, channel_count);
        return audio_data;
    }
}
const bpm_detector = new VolumeNormalizedBPMDetector(80, 0.15);
const audio_array_tool = new AudioArrayTool(68, 68);
let ui_worker = undefined;
let current_audio_data = 1;
function wallpaperAudioListener(audioArray) {
    // every 30 data assuming audio resolution of 30 "fps"
    if (current_audio_data % 6 == 0) {
    }
    else {
        current_audio_data += 1;
        return;
    }
    current_audio_data = 1;
    const bpm = bpm_detector.calculate_bpm(Date.now(), audio_array_tool.getFromBassLeftAudioChannel(audioArray, 35, 15));
    const next_beat = bpm_detector.get_time_off_next_beat_if_bpm_changed();
    if (ui_worker != undefined) {
        ui_worker.postMessage({ message: "bpmUpdate", bpm: bpm, nextBeatTime: next_beat });
    }
    console.log("current bpm: %d, next_beat time: %f", bpm, next_beat);
}
function add_wallpaper_engine_audio_listening(uiWorker = undefined) {
    if (isRunningInWallpaperEngine() && "wallpaperRegisterAudioListener" in window) {
        console.log("adding audio listener");
        const audio_listener = window.wallpaperRegisterAudioListener;
        audio_listener(wallpaperAudioListener);
    }
    else {
        console.log("not in wallpaper engine");
    }
}
function set_ui_worker(p_ui_worker) {
    if (p_ui_worker == null) {
        ui_worker = undefined;
        return;
    }
    ui_worker = p_ui_worker;
}


/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbHBhcGVyX2VuZ2luZS5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7VUFBQTtVQUNBOzs7OztXQ0RBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQ0FBa0MsNEJBQTRCO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDRCQUE0QjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQixTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQyx5REFBeUQ7QUFDekY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwRiIsInNvdXJjZXMiOlsid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9tYWluL3dhbGxwYXBlcl9lbmdpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJjbGFzcyBCUE1EZXRlY3RvciB7XG4gICAgY29uc3RydWN0b3IoZGVmYXVsdF9icG0sIG5lZWRlZF9kaWZmZXJlbmNlID0gMC4zLCBtYXhfYnBtID0gMjQwKSB7XG4gICAgICAgIHRoaXMua2VwdF9lbnRyeV9jb3VudCA9IDUwO1xuICAgICAgICB0aGlzLnBfZCA9IG5ldyBQZWFrRGV0ZWN0b3IoKTtcbiAgICAgICAgdGhpcy5lX3ZhbHVlcyA9IFtdO1xuICAgICAgICB0aGlzLmRlZmF1bHRfYnBtID0gZGVmYXVsdF9icG07XG4gICAgICAgIHRoaXMubmVlZGVkX2RpZmZlcmVuY2UgPSBuZWVkZWRfZGlmZmVyZW5jZTtcbiAgICAgICAgdGhpcy5tYXhfYnBtID0gbWF4X2JwbTtcbiAgICAgICAgdGhpcy5icG1fY2hhbmdlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBjYWxjdWxhdGVfYnBtKHRpbWVfbXMsIGF1ZGlvX2RhdGEsIG5lZWRlZF9kaWZmZXJlbmNlID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlX29sZF9lbnRyaWVzKCk7XG4gICAgICAgIGxldCBsYXJnZV9lbmVyZ3lfY2hhbmdlO1xuICAgICAgICBpZiAobmVlZGVkX2RpZmZlcmVuY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFyZ2VfZW5lcmd5X2NoYW5nZSA9IHRoaXMucF9kLmRldGVjdF9sYXJnZV9lbmVyZ3lfY2hhbmdlcyhhdWRpb19kYXRhLCB0aGlzLm5lZWRlZF9kaWZmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxhcmdlX2VuZXJneV9jaGFuZ2UgPSB0aGlzLnBfZC5kZXRlY3RfbGFyZ2VfZW5lcmd5X2NoYW5nZXMoYXVkaW9fZGF0YSwgbmVlZGVkX2RpZmZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZV92YWx1ZXMucHVzaCh7XG4gICAgICAgICAgICBpc19iZWF0OiBsYXJnZV9lbmVyZ3lfY2hhbmdlLmlzX3BlYWssXG4gICAgICAgICAgICBwb2ludF9pbl90aW1lX21zOiB0aW1lX21zLFxuICAgICAgICAgICAgZW5lcmd5OiBsYXJnZV9lbmVyZ3lfY2hhbmdlLnZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuZV92YWx1ZXMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdF9icG07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdF9iZWF0ID0gdGhpcy5nZXRfbGFzdF9iZWF0KCk7XG4gICAgICAgIGlmIChsYXN0X2JlYXQgPT0gbnVsbCB8fCAhbGFyZ2VfZW5lcmd5X2NoYW5nZS5pc19wZWFrKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWZhdWx0X2JwbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBicG0gPSAoMSAqIDYwKSAvICgodGltZV9tcyAtIGxhc3RfYmVhdC5wb2ludF9pbl90aW1lX21zKSAvIDEwMDApO1xuICAgICAgICBpZiAoYnBtICE9IHRoaXMuZGVmYXVsdF9icG0pIHtcbiAgICAgICAgICAgIHRoaXMuYnBtX2NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVmYXVsdF9icG0gPSBNYXRoLm1pbihicG0sIHRoaXMubWF4X2JwbSk7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihicG0sIHRoaXMubWF4X2JwbSk7XG4gICAgfVxuICAgIGdldF9sYXN0X2JlYXQoKSB7XG4gICAgICAgIGNvbnN0IGlnbm9yZV9maXJzdF9iZWF0X2NvdW50ID0gMTtcbiAgICAgICAgY29uc3QgcmV2ZXJzZWRfdmFsdWVzX2V4Y2VwdF9uZXdlc3QgPSB0aGlzLmVfdmFsdWVzXG4gICAgICAgICAgICAuc2xpY2UoaWdub3JlX2ZpcnN0X2JlYXRfY291bnQsIHRoaXMuZV92YWx1ZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIC5yZXZlcnNlKCk7XG4gICAgICAgIGlmICh0aGlzLmVfdmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmV2ZXJzZWRfdmFsdWVzX2V4Y2VwdF9uZXdlc3QpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzX2JlYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBwb2ludF9pbl90aW1lX21zOiBlbGVtZW50LnBvaW50X2luX3RpbWVfbXMsIGVuZXJneTogZWxlbWVudC5lbmVyZ3kgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmVtb3ZlX29sZF9lbnRyaWVzKCkge1xuICAgICAgICBpZiAodGhpcy5lX3ZhbHVlcy5sZW5ndGggPj0gdGhpcy5rZXB0X2VudHJ5X2NvdW50KSB7XG4gICAgICAgICAgICAvLyBjb25zdCBmaWx0ZXJlZF9wZWFrcyA9IHRoaXMuZV92YWx1ZXMuZmlsdGVyKCh2YWx1ZXMsIGksIGFycikgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiB2YWx1ZXMuaXNfYmVhdDtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgbGV0IGxhc3RfYmVhdF9pbmRleDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2luZGV4LCBlbmVyZ3lfdmFsdWVdIG9mIHRoaXMuZV92YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVuZXJneV92YWx1ZS5pc19iZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfYmVhdF9pbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsYXN0X2JlYXRfaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhc3RfYmVhdF9pbmRleCA9IHRoaXMuZV92YWx1ZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZV92YWx1ZXMgPSB0aGlzLmVfdmFsdWVzLnNsaWNlKGxhc3RfYmVhdF9pbmRleCwgdGhpcy5rZXB0X2VudHJ5X2NvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRfdGltZV9vZmZfbmV4dF9iZWF0X2lmX2JwbV9jaGFuZ2VkKCkge1xuICAgICAgICBsZXQgbGFzdF9iZWF0X2luZGV4ID0gMDtcbiAgICAgICAgaWYgKCF0aGlzLmJwbV9jaGFuZ2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IFtpbmRleCwgZW5lcmd5X3ZhbHVlXSBvZiB0aGlzLmVfdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgaWYgKGVuZXJneV92YWx1ZS5pc19iZWF0KSB7XG4gICAgICAgICAgICAgICAgbGFzdF9iZWF0X2luZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZV92YWx1ZSA9IHRoaXMuZV92YWx1ZXNbbGFzdF9iZWF0X2luZGV4XTtcbiAgICAgICAgaWYgKGVfdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3Qgc2Vjb25kc19wZXJfYmVhdCA9IDYwIC8gdGhpcy5kZWZhdWx0X2JwbTtcbiAgICAgICAgICAgIHJldHVybiBlX3ZhbHVlLnBvaW50X2luX3RpbWVfbXMgKyBzZWNvbmRzX3Blcl9iZWF0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmNsYXNzIFZvbHVtZU5vcm1hbGl6ZWRCUE1EZXRlY3RvciBleHRlbmRzIEJQTURldGVjdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0X2JwbSwgYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSA9IDAuNSwgbWF4X2JwbSA9IDIwMCkge1xuICAgICAgICBzdXBlcihkZWZhdWx0X2JwbSwgYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSwgbWF4X2JwbSk7XG4gICAgICAgIHRoaXMuYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSA9IGF2ZXJhZ2VfcmVsYXRpdmVfbmVlZGVkX2RpZmZlcmVuY2U7XG4gICAgICAgIHRoaXMuY3VycmVudF9hdWRpb19hdmVyYWdlID0gMC41O1xuICAgICAgICB0aGlzLmxhc3RfYnBtcyA9IFtdO1xuICAgICAgICB0aGlzLmJlYXRfY2hhbmdlX2FmdGVyX3NlY29uZHMgPSAwLjE1O1xuICAgIH1cbiAgICBjYWxjdWxhdGVfYnBtKHRpbWVfbXMsIGF1ZGlvX2RhdGEpIHtcbiAgICAgICAgLy8gRG9lc24ndCB3b3JrIGdyZWF0IGJlY2F1c2Ugb2YgaW50ZXJuYWwgcm1zXG4gICAgICAgIGNvbnN0IHN1bSA9IGF1ZGlvX2RhdGEucmVkdWNlKChwcmUsIGN1cl92YWwsIGluZCwgYXJyKSA9PiBwcmUgKyBNYXRoLm1pbihjdXJfdmFsLCAxLjApKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IChzdW0gKyB0aGlzLmN1cnJlbnRfYXVkaW9fYXZlcmFnZSkgLyAoYXVkaW9fZGF0YS5sZW5ndGggKyAxKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZV93aXRoX29mZnNldCA9IGF2ZXJhZ2UgKyAoMSAvIDEwKSAqIHRoaXMuY3VycmVudF9hdWRpb19hdmVyYWdlO1xuICAgICAgICAvLyBUT0RPIHRyeSBvdXQgZGlmZmVyZW50IG5vcm1hbGl6YXRpb25cbiAgICAgICAgY29uc3QgYXVkaW9fZGF0YV9ub3JtYWxpemVkID0gYXVkaW9fZGF0YS5tYXAoKHZhbCwgaSwgYXJyKSA9PiB2YWwgLyBhdmVyYWdlX3dpdGhfb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5jdXJyZW50X2F1ZGlvX2F2ZXJhZ2UgPSBhdmVyYWdlX3dpdGhfb2Zmc2V0O1xuICAgICAgICAvLyBjb25zdCBuZWVkZWRfZGlmZmVyZW5jZSA9XG4gICAgICAgIC8vICAgICB0aGlzLmF2ZXJhZ2VfcmVsYXRpdmVfbmVlZGVkX2RpZmZlcmVuY2UgKiB0aGlzLmN1cnJlbnRfYXVkaW9fYXZlcmFnZTtcbiAgICAgICAgY29uc3QgYnBtID0gc3VwZXIuY2FsY3VsYXRlX2JwbSh0aW1lX21zLCBhdWRpb19kYXRhX25vcm1hbGl6ZWQsIHRoaXMuYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSk7XG4gICAgICAgIGlmICh0aGlzLmxhc3RfYnBtcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X2JwbXMucHVzaCh7IHRpbWVfbXM6IHRpbWVfbXMsIGJwbTogYnBtIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJwbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYXN0X2JwbSA9IHRoaXMubGFzdF9icG1zW3RoaXMubGFzdF9icG1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoKHRpbWVfbXMgLSBsYXN0X2JwbS50aW1lX21zKSAvIDEwMDAgPiB0aGlzLmJlYXRfY2hhbmdlX2FmdGVyX3NlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdF9icG1zLnB1c2goeyB0aW1lX21zOiB0aW1lX21zLCBicG06IGJwbSB9KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGFzdF9icG0uYnBtO1xuICAgIH1cbn1cbmNsYXNzIFBlYWtEZXRlY3RvciB7XG4gICAgY29uc3RydWN0b3IobGFzdF9STVMgPSAwKSB7XG4gICAgICAgIHRoaXMubGFzdF9STVMgPSBsYXN0X1JNUztcbiAgICB9XG4gICAgZGV0ZWN0X2xhcmdlX2VuZXJneV9jaGFuZ2VzKGFyciwgbmVlZGVkX2RpZmZlcmVuY2UgPSAwLjMpIHtcbiAgICAgICAgY29uc3QgY3VycmVudF9STVMgPSB0aGlzLmNhbGN1bGF0ZV9Sb290TWVhblNxdWFyZShhcnIsIHRoaXMubGFzdF9STVMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcImN1cnJlbnQgUk1TICVmXCIsIGN1cnJlbnRfUk1TKTtcbiAgICAgICAgY29uc3QgaXNfbmV3X3Jtc19wZWFrID0gY3VycmVudF9STVMgLSBuZWVkZWRfZGlmZmVyZW5jZSA+IHRoaXMubGFzdF9STVM7XG4gICAgICAgIHRoaXMubGFzdF9STVMgPSBjdXJyZW50X1JNUztcbiAgICAgICAgcmV0dXJuIHsgdmFsdWU6IGN1cnJlbnRfUk1TLCBpc19wZWFrOiBpc19uZXdfcm1zX3BlYWsgfTtcbiAgICB9XG4gICAgY2FsY3VsYXRlX1Jvb3RNZWFuU3F1YXJlKGFyciwgbGFzdF9STVMgPSAwKSB7XG4gICAgICAgIGNvbnN0IHBvd19vZl8yX3N1bSA9IGFyci5yZWR1Y2UoKHAsIGMsIGluZCwgYXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBub3JtYWxpemVkX3ZhbCA9IE1hdGgubWluKGMsIDEuMCk7XG4gICAgICAgICAgICByZXR1cm4gcCArIE1hdGgucG93KG5vcm1hbGl6ZWRfdmFsLCAyKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICAgIGNvbnN0IHJtcyA9IE1hdGguc3FydCgocG93X29mXzJfc3VtICsgbGFzdF9STVMpIC8gKGFyci5sZW5ndGggKyAxKSk7XG4gICAgICAgIHJldHVybiBybXM7XG4gICAgfVxuICAgIGZpbmRfbWF4X2luZGljZXMoYXJyLCBtYXhfdGhyZXNob2xkID0gMC4xKSB7XG4gICAgICAgIGlmIChhcnIubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUT0RPIHJlZHVjZSBpdGVyYXRpb24gY291bnRcbiAgICAgICAgY29uc3QgaW5kZXhlZF9wZWFrcyA9IGFyci5tYXAoKHYsIGksIGFycikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHsgaW5kZXg6IGksIHZhbHVlOiB2IH07XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBpbmRleGVkX2FzY2VuZGluZ19wZWFrcyA9IGluZGV4ZWRfcGVha3Muc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEudmFsdWUgLSBiLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgYWJzb2x1dGVfbWF4ID0gaW5kZXhlZF9hc2NlbmRpbmdfcGVha3MucG9wKCk7XG4gICAgICAgIGNvbnN0IHVuaXF1ZV9tYXhfaW5fdGhyZXNob2xkcyA9IGluZGV4ZWRfYXNjZW5kaW5nX3BlYWtzLmZpbHRlcigodmFsdWUsIGluZCwgYXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gKGFic29sdXRlX21heC52YWx1ZSAhPSB2YWx1ZS52YWx1ZSAmJlxuICAgICAgICAgICAgICAgIGFic29sdXRlX21heC52YWx1ZSAtIHZhbHVlLnZhbHVlIDw9IG1heF90aHJlc2hvbGQpO1xuICAgICAgICB9KTtcbiAgICAgICAgdW5pcXVlX21heF9pbl90aHJlc2hvbGRzLnB1c2goYWJzb2x1dGVfbWF4KTtcbiAgICAgICAgcmV0dXJuIHVuaXF1ZV9tYXhfaW5fdGhyZXNob2xkcztcbiAgICB9XG59XG5mdW5jdGlvbiBpc1J1bm5pbmdJbldhbGxwYXBlckVuZ2luZSgpIHtcbiAgICByZXR1cm4gdHlwZW9mIHdpbmRvdy53YWxscGFwZXIgIT09IHVuZGVmaW5lZDtcbn1cbmNsYXNzIEF1ZGlvQXJyYXlUb29sIHtcbiAgICBjb25zdHJ1Y3RvcihsZWZ0X2F1ZGlvX2NoYW5uZWxzLCByaWdodF9hdWRpb19jaGFubmVscykge1xuICAgICAgICB0aGlzLmxlZnRfYXVkaW9fY2hhbm5lbHMgPSBsZWZ0X2F1ZGlvX2NoYW5uZWxzO1xuICAgICAgICB0aGlzLnJpZ2h0X2F1ZGlvX2NoYW5uZWxzID0gcmlnaHRfYXVkaW9fY2hhbm5lbHM7XG4gICAgfVxuICAgIGdldEZyb21CYXNzTGVmdEF1ZGlvQ2hhbm5lbChhdWRpb19hcnJheSwgY2hhbm5lbF9jb3VudCwgc3RhcnRfY2hhbm5lbCA9IDApIHtcbiAgICAgICAgaWYgKGNoYW5uZWxfY291bnQgPT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGF1ZGlvX2FycmF5LnNsaWNlKHN0YXJ0X2NoYW5uZWwsIHRoaXMubGVmdF9hdWRpb19jaGFubmVscyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdGFydF9jaGFubmVsID0gTWF0aC5taW4oY2hhbm5lbF9jb3VudCwgc3RhcnRfY2hhbm5lbCk7XG4gICAgICAgICAgICBjaGFubmVsX2NvdW50ID0gTWF0aC5taW4oTWF0aC5tYXgoY2hhbm5lbF9jb3VudCwgc3RhcnRfY2hhbm5lbCksIHRoaXMubGVmdF9hdWRpb19jaGFubmVscyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYXVkaW9fZGF0YSA9IGF1ZGlvX2FycmF5LnNsaWNlKHN0YXJ0X2NoYW5uZWwsIGNoYW5uZWxfY291bnQpO1xuICAgICAgICByZXR1cm4gYXVkaW9fZGF0YTtcbiAgICB9XG59XG5jb25zdCBicG1fZGV0ZWN0b3IgPSBuZXcgVm9sdW1lTm9ybWFsaXplZEJQTURldGVjdG9yKDgwLCAwLjE1KTtcbmNvbnN0IGF1ZGlvX2FycmF5X3Rvb2wgPSBuZXcgQXVkaW9BcnJheVRvb2woNjgsIDY4KTtcbmxldCB1aV93b3JrZXIgPSB1bmRlZmluZWQ7XG5sZXQgY3VycmVudF9hdWRpb19kYXRhID0gMTtcbmZ1bmN0aW9uIHdhbGxwYXBlckF1ZGlvTGlzdGVuZXIoYXVkaW9BcnJheSkge1xuICAgIC8vIGV2ZXJ5IDMwIGRhdGEgYXNzdW1pbmcgYXVkaW8gcmVzb2x1dGlvbiBvZiAzMCBcImZwc1wiXG4gICAgaWYgKGN1cnJlbnRfYXVkaW9fZGF0YSAlIDYgPT0gMCkge1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY3VycmVudF9hdWRpb19kYXRhICs9IDE7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY3VycmVudF9hdWRpb19kYXRhID0gMTtcbiAgICBjb25zdCBicG0gPSBicG1fZGV0ZWN0b3IuY2FsY3VsYXRlX2JwbShEYXRlLm5vdygpLCBhdWRpb19hcnJheV90b29sLmdldEZyb21CYXNzTGVmdEF1ZGlvQ2hhbm5lbChhdWRpb0FycmF5LCAzNSwgMTUpKTtcbiAgICBjb25zdCBuZXh0X2JlYXQgPSBicG1fZGV0ZWN0b3IuZ2V0X3RpbWVfb2ZmX25leHRfYmVhdF9pZl9icG1fY2hhbmdlZCgpO1xuICAgIGlmICh1aV93b3JrZXIgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHVpX3dvcmtlci5wb3N0TWVzc2FnZSh7IG1lc3NhZ2U6IFwiYnBtVXBkYXRlXCIsIGJwbTogYnBtLCBuZXh0QmVhdFRpbWU6IG5leHRfYmVhdCB9KTtcbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJjdXJyZW50IGJwbTogJWQsIG5leHRfYmVhdCB0aW1lOiAlZlwiLCBicG0sIG5leHRfYmVhdCk7XG59XG5mdW5jdGlvbiBhZGRfd2FsbHBhcGVyX2VuZ2luZV9hdWRpb19saXN0ZW5pbmcodWlXb3JrZXIgPSB1bmRlZmluZWQpIHtcbiAgICBpZiAoaXNSdW5uaW5nSW5XYWxscGFwZXJFbmdpbmUoKSAmJiBcIndhbGxwYXBlclJlZ2lzdGVyQXVkaW9MaXN0ZW5lclwiIGluIHdpbmRvdykge1xuICAgICAgICBjb25zb2xlLmxvZyhcImFkZGluZyBhdWRpbyBsaXN0ZW5lclwiKTtcbiAgICAgICAgY29uc3QgYXVkaW9fbGlzdGVuZXIgPSB3aW5kb3cud2FsbHBhcGVyUmVnaXN0ZXJBdWRpb0xpc3RlbmVyO1xuICAgICAgICBhdWRpb19saXN0ZW5lcih3YWxscGFwZXJBdWRpb0xpc3RlbmVyKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwibm90IGluIHdhbGxwYXBlciBlbmdpbmVcIik7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X3VpX3dvcmtlcihwX3VpX3dvcmtlcikge1xuICAgIGlmIChwX3VpX3dvcmtlciA9PSBudWxsKSB7XG4gICAgICAgIHVpX3dvcmtlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB1aV93b3JrZXIgPSBwX3VpX3dvcmtlcjtcbn1cbmV4cG9ydCB7IHNldF91aV93b3JrZXIsIGFkZF93YWxscGFwZXJfZW5naW5lX2F1ZGlvX2xpc3RlbmluZywgUGVha0RldGVjdG9yLCBCUE1EZXRlY3RvciB9O1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9