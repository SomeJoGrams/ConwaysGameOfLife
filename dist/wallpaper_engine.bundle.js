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
            this.bpm_changed = false;
            return this.default_bpm;
        }
        const last_beat = this.get_last_beat();
        if (last_beat == null || !large_energy_change.is_peak) {
            this.bpm_changed = false;
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
        if (!this.bpm_changed) {
            return null;
        }
        let last_beat_index = 0;
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
        this.last_bpms = this.last_bpms.slice(0, 100);
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
        ui_worker.postMessage({ message: "bpmUpdate", bpm: bpm, next_beat_time: next_beat });
    }
    console.log("current bpm: %d, next beat time: %f", bpm, next_beat);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2FsbHBhcGVyX2VuZ2luZS5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7VUFBQTtVQUNBOzs7OztXQ0RBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7Ozs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLDRCQUE0QjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyw0QkFBNEI7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQixTQUFTO0FBQ1Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUFnQywyREFBMkQ7QUFDM0Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUMwRiIsInNvdXJjZXMiOlsid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL3NyYy9tYWluL3dhbGxwYXBlcl9lbmdpbmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhlIHJlcXVpcmUgc2NvcGVcbnZhciBfX3dlYnBhY2tfcmVxdWlyZV9fID0ge307XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJjbGFzcyBCUE1EZXRlY3RvciB7XG4gICAgY29uc3RydWN0b3IoZGVmYXVsdF9icG0sIG5lZWRlZF9kaWZmZXJlbmNlID0gMC4zLCBtYXhfYnBtID0gMjQwKSB7XG4gICAgICAgIHRoaXMua2VwdF9lbnRyeV9jb3VudCA9IDUwO1xuICAgICAgICB0aGlzLnBfZCA9IG5ldyBQZWFrRGV0ZWN0b3IoKTtcbiAgICAgICAgdGhpcy5lX3ZhbHVlcyA9IFtdO1xuICAgICAgICB0aGlzLmRlZmF1bHRfYnBtID0gZGVmYXVsdF9icG07XG4gICAgICAgIHRoaXMubmVlZGVkX2RpZmZlcmVuY2UgPSBuZWVkZWRfZGlmZmVyZW5jZTtcbiAgICAgICAgdGhpcy5tYXhfYnBtID0gbWF4X2JwbTtcbiAgICAgICAgdGhpcy5icG1fY2hhbmdlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBjYWxjdWxhdGVfYnBtKHRpbWVfbXMsIGF1ZGlvX2RhdGEsIG5lZWRlZF9kaWZmZXJlbmNlID0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlX29sZF9lbnRyaWVzKCk7XG4gICAgICAgIGxldCBsYXJnZV9lbmVyZ3lfY2hhbmdlO1xuICAgICAgICBpZiAobmVlZGVkX2RpZmZlcmVuY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgbGFyZ2VfZW5lcmd5X2NoYW5nZSA9IHRoaXMucF9kLmRldGVjdF9sYXJnZV9lbmVyZ3lfY2hhbmdlcyhhdWRpb19kYXRhLCB0aGlzLm5lZWRlZF9kaWZmZXJlbmNlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGxhcmdlX2VuZXJneV9jaGFuZ2UgPSB0aGlzLnBfZC5kZXRlY3RfbGFyZ2VfZW5lcmd5X2NoYW5nZXMoYXVkaW9fZGF0YSwgbmVlZGVkX2RpZmZlcmVuY2UpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZV92YWx1ZXMucHVzaCh7XG4gICAgICAgICAgICBpc19iZWF0OiBsYXJnZV9lbmVyZ3lfY2hhbmdlLmlzX3BlYWssXG4gICAgICAgICAgICBwb2ludF9pbl90aW1lX21zOiB0aW1lX21zLFxuICAgICAgICAgICAgZW5lcmd5OiBsYXJnZV9lbmVyZ3lfY2hhbmdlLnZhbHVlLFxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuZV92YWx1ZXMubGVuZ3RoIDwgMikge1xuICAgICAgICAgICAgdGhpcy5icG1fY2hhbmdlZCA9IGZhbHNlO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVmYXVsdF9icG07XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbGFzdF9iZWF0ID0gdGhpcy5nZXRfbGFzdF9iZWF0KCk7XG4gICAgICAgIGlmIChsYXN0X2JlYXQgPT0gbnVsbCB8fCAhbGFyZ2VfZW5lcmd5X2NoYW5nZS5pc19wZWFrKSB7XG4gICAgICAgICAgICB0aGlzLmJwbV9jaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWZhdWx0X2JwbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBicG0gPSAoMSAqIDYwKSAvICgodGltZV9tcyAtIGxhc3RfYmVhdC5wb2ludF9pbl90aW1lX21zKSAvIDEwMDApO1xuICAgICAgICBpZiAoYnBtICE9IHRoaXMuZGVmYXVsdF9icG0pIHtcbiAgICAgICAgICAgIHRoaXMuYnBtX2NoYW5nZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZGVmYXVsdF9icG0gPSBNYXRoLm1pbihicG0sIHRoaXMubWF4X2JwbSk7XG4gICAgICAgIHJldHVybiBNYXRoLm1pbihicG0sIHRoaXMubWF4X2JwbSk7XG4gICAgfVxuICAgIGdldF9sYXN0X2JlYXQoKSB7XG4gICAgICAgIGNvbnN0IGlnbm9yZV9maXJzdF9iZWF0X2NvdW50ID0gMTtcbiAgICAgICAgY29uc3QgcmV2ZXJzZWRfdmFsdWVzX2V4Y2VwdF9uZXdlc3QgPSB0aGlzLmVfdmFsdWVzXG4gICAgICAgICAgICAuc2xpY2UoaWdub3JlX2ZpcnN0X2JlYXRfY291bnQsIHRoaXMuZV92YWx1ZXMubGVuZ3RoIC0gMSlcbiAgICAgICAgICAgIC5yZXZlcnNlKCk7XG4gICAgICAgIGlmICh0aGlzLmVfdmFsdWVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IGVsZW1lbnQgb2YgcmV2ZXJzZWRfdmFsdWVzX2V4Y2VwdF9uZXdlc3QpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LmlzX2JlYXQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geyBwb2ludF9pbl90aW1lX21zOiBlbGVtZW50LnBvaW50X2luX3RpbWVfbXMsIGVuZXJneTogZWxlbWVudC5lbmVyZ3kgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmVtb3ZlX29sZF9lbnRyaWVzKCkge1xuICAgICAgICBpZiAodGhpcy5lX3ZhbHVlcy5sZW5ndGggPj0gdGhpcy5rZXB0X2VudHJ5X2NvdW50KSB7XG4gICAgICAgICAgICAvLyBjb25zdCBmaWx0ZXJlZF9wZWFrcyA9IHRoaXMuZV92YWx1ZXMuZmlsdGVyKCh2YWx1ZXMsIGksIGFycikgPT4ge1xuICAgICAgICAgICAgLy8gICAgIHJldHVybiB2YWx1ZXMuaXNfYmVhdDtcbiAgICAgICAgICAgIC8vIH0pO1xuICAgICAgICAgICAgbGV0IGxhc3RfYmVhdF9pbmRleDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgW2luZGV4LCBlbmVyZ3lfdmFsdWVdIG9mIHRoaXMuZV92YWx1ZXMuZW50cmllcygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVuZXJneV92YWx1ZS5pc19iZWF0KSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfYmVhdF9pbmRleCA9IGluZGV4O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsYXN0X2JlYXRfaW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGxhc3RfYmVhdF9pbmRleCA9IHRoaXMuZV92YWx1ZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZV92YWx1ZXMgPSB0aGlzLmVfdmFsdWVzLnNsaWNlKGxhc3RfYmVhdF9pbmRleCwgdGhpcy5rZXB0X2VudHJ5X2NvdW50KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXRfdGltZV9vZmZfbmV4dF9iZWF0X2lmX2JwbV9jaGFuZ2VkKCkge1xuICAgICAgICBpZiAoIXRoaXMuYnBtX2NoYW5nZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGxldCBsYXN0X2JlYXRfaW5kZXggPSAwO1xuICAgICAgICBmb3IgKGNvbnN0IFtpbmRleCwgZW5lcmd5X3ZhbHVlXSBvZiB0aGlzLmVfdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgICAgaWYgKGVuZXJneV92YWx1ZS5pc19iZWF0KSB7XG4gICAgICAgICAgICAgICAgbGFzdF9iZWF0X2luZGV4ID0gaW5kZXg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZV92YWx1ZSA9IHRoaXMuZV92YWx1ZXNbbGFzdF9iZWF0X2luZGV4XTtcbiAgICAgICAgaWYgKGVfdmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3Qgc2Vjb25kc19wZXJfYmVhdCA9IDYwIC8gdGhpcy5kZWZhdWx0X2JwbTtcbiAgICAgICAgICAgIHJldHVybiBlX3ZhbHVlLnBvaW50X2luX3RpbWVfbXMgKyBzZWNvbmRzX3Blcl9iZWF0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn1cbmNsYXNzIFZvbHVtZU5vcm1hbGl6ZWRCUE1EZXRlY3RvciBleHRlbmRzIEJQTURldGVjdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihkZWZhdWx0X2JwbSwgYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSA9IDAuNSwgbWF4X2JwbSA9IDIwMCkge1xuICAgICAgICBzdXBlcihkZWZhdWx0X2JwbSwgYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSwgbWF4X2JwbSk7XG4gICAgICAgIHRoaXMuYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSA9IGF2ZXJhZ2VfcmVsYXRpdmVfbmVlZGVkX2RpZmZlcmVuY2U7XG4gICAgICAgIHRoaXMuY3VycmVudF9hdWRpb19hdmVyYWdlID0gMC41O1xuICAgICAgICB0aGlzLmxhc3RfYnBtcyA9IFtdO1xuICAgICAgICB0aGlzLmJlYXRfY2hhbmdlX2FmdGVyX3NlY29uZHMgPSAwLjE1O1xuICAgIH1cbiAgICBjYWxjdWxhdGVfYnBtKHRpbWVfbXMsIGF1ZGlvX2RhdGEpIHtcbiAgICAgICAgLy8gRG9lc24ndCB3b3JrIGdyZWF0IGJlY2F1c2Ugb2YgaW50ZXJuYWwgcm1zXG4gICAgICAgIGNvbnN0IHN1bSA9IGF1ZGlvX2RhdGEucmVkdWNlKChwcmUsIGN1cl92YWwsIGluZCwgYXJyKSA9PiBwcmUgKyBNYXRoLm1pbihjdXJfdmFsLCAxLjApKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZSA9IChzdW0gKyB0aGlzLmN1cnJlbnRfYXVkaW9fYXZlcmFnZSkgLyAoYXVkaW9fZGF0YS5sZW5ndGggKyAxKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZV93aXRoX29mZnNldCA9IGF2ZXJhZ2UgKyAoMSAvIDEwKSAqIHRoaXMuY3VycmVudF9hdWRpb19hdmVyYWdlO1xuICAgICAgICAvLyBUT0RPIHRyeSBvdXQgZGlmZmVyZW50IG5vcm1hbGl6YXRpb25cbiAgICAgICAgY29uc3QgYXVkaW9fZGF0YV9ub3JtYWxpemVkID0gYXVkaW9fZGF0YS5tYXAoKHZhbCwgaSwgYXJyKSA9PiB2YWwgLyBhdmVyYWdlX3dpdGhfb2Zmc2V0KTtcbiAgICAgICAgdGhpcy5jdXJyZW50X2F1ZGlvX2F2ZXJhZ2UgPSBhdmVyYWdlX3dpdGhfb2Zmc2V0O1xuICAgICAgICAvLyBjb25zdCBuZWVkZWRfZGlmZmVyZW5jZSA9XG4gICAgICAgIC8vICAgICB0aGlzLmF2ZXJhZ2VfcmVsYXRpdmVfbmVlZGVkX2RpZmZlcmVuY2UgKiB0aGlzLmN1cnJlbnRfYXVkaW9fYXZlcmFnZTtcbiAgICAgICAgY29uc3QgYnBtID0gc3VwZXIuY2FsY3VsYXRlX2JwbSh0aW1lX21zLCBhdWRpb19kYXRhX25vcm1hbGl6ZWQsIHRoaXMuYXZlcmFnZV9yZWxhdGl2ZV9uZWVkZWRfZGlmZmVyZW5jZSk7XG4gICAgICAgIGlmICh0aGlzLmxhc3RfYnBtcy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X2JwbXMucHVzaCh7IHRpbWVfbXM6IHRpbWVfbXMsIGJwbTogYnBtIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGJwbTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsYXN0X2JwbSA9IHRoaXMubGFzdF9icG1zW3RoaXMubGFzdF9icG1zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoKHRpbWVfbXMgLSBsYXN0X2JwbS50aW1lX21zKSAvIDEwMDAgPiB0aGlzLmJlYXRfY2hhbmdlX2FmdGVyX3NlY29uZHMpIHtcbiAgICAgICAgICAgIHRoaXMubGFzdF9icG1zLnB1c2goeyB0aW1lX21zOiB0aW1lX21zLCBicG06IGJwbSB9KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxhc3RfYnBtcyA9IHRoaXMubGFzdF9icG1zLnNsaWNlKDAsIDEwMCk7XG4gICAgICAgIHJldHVybiBsYXN0X2JwbS5icG07XG4gICAgfVxufVxuY2xhc3MgUGVha0RldGVjdG9yIHtcbiAgICBjb25zdHJ1Y3RvcihsYXN0X1JNUyA9IDApIHtcbiAgICAgICAgdGhpcy5sYXN0X1JNUyA9IGxhc3RfUk1TO1xuICAgIH1cbiAgICBkZXRlY3RfbGFyZ2VfZW5lcmd5X2NoYW5nZXMoYXJyLCBuZWVkZWRfZGlmZmVyZW5jZSA9IDAuMykge1xuICAgICAgICBjb25zdCBjdXJyZW50X1JNUyA9IHRoaXMuY2FsY3VsYXRlX1Jvb3RNZWFuU3F1YXJlKGFyciwgdGhpcy5sYXN0X1JNUyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY3VycmVudCBSTVMgJWZcIiwgY3VycmVudF9STVMpO1xuICAgICAgICBjb25zdCBpc19uZXdfcm1zX3BlYWsgPSBjdXJyZW50X1JNUyAtIG5lZWRlZF9kaWZmZXJlbmNlID4gdGhpcy5sYXN0X1JNUztcbiAgICAgICAgdGhpcy5sYXN0X1JNUyA9IGN1cnJlbnRfUk1TO1xuICAgICAgICByZXR1cm4geyB2YWx1ZTogY3VycmVudF9STVMsIGlzX3BlYWs6IGlzX25ld19ybXNfcGVhayB9O1xuICAgIH1cbiAgICBjYWxjdWxhdGVfUm9vdE1lYW5TcXVhcmUoYXJyLCBsYXN0X1JNUyA9IDApIHtcbiAgICAgICAgY29uc3QgcG93X29mXzJfc3VtID0gYXJyLnJlZHVjZSgocCwgYywgaW5kLCBhcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5vcm1hbGl6ZWRfdmFsID0gTWF0aC5taW4oYywgMS4wKTtcbiAgICAgICAgICAgIHJldHVybiBwICsgTWF0aC5wb3cobm9ybWFsaXplZF92YWwsIDIpO1xuICAgICAgICB9LCAwKTtcbiAgICAgICAgY29uc3Qgcm1zID0gTWF0aC5zcXJ0KChwb3dfb2ZfMl9zdW0gKyBsYXN0X1JNUykgLyAoYXJyLmxlbmd0aCArIDEpKTtcbiAgICAgICAgcmV0dXJuIHJtcztcbiAgICB9XG4gICAgZmluZF9tYXhfaW5kaWNlcyhhcnIsIG1heF90aHJlc2hvbGQgPSAwLjEpIHtcbiAgICAgICAgaWYgKGFyci5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIFRPRE8gcmVkdWNlIGl0ZXJhdGlvbiBjb3VudFxuICAgICAgICBjb25zdCBpbmRleGVkX3BlYWtzID0gYXJyLm1hcCgodiwgaSwgYXJyKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4geyBpbmRleDogaSwgdmFsdWU6IHYgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNvbnN0IGluZGV4ZWRfYXNjZW5kaW5nX3BlYWtzID0gaW5kZXhlZF9wZWFrcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYS52YWx1ZSAtIGIudmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCBhYnNvbHV0ZV9tYXggPSBpbmRleGVkX2FzY2VuZGluZ19wZWFrcy5wb3AoKTtcbiAgICAgICAgY29uc3QgdW5pcXVlX21heF9pbl90aHJlc2hvbGRzID0gaW5kZXhlZF9hc2NlbmRpbmdfcGVha3MuZmlsdGVyKCh2YWx1ZSwgaW5kLCBhcnIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiAoYWJzb2x1dGVfbWF4LnZhbHVlICE9IHZhbHVlLnZhbHVlICYmXG4gICAgICAgICAgICAgICAgYWJzb2x1dGVfbWF4LnZhbHVlIC0gdmFsdWUudmFsdWUgPD0gbWF4X3RocmVzaG9sZCk7XG4gICAgICAgIH0pO1xuICAgICAgICB1bmlxdWVfbWF4X2luX3RocmVzaG9sZHMucHVzaChhYnNvbHV0ZV9tYXgpO1xuICAgICAgICByZXR1cm4gdW5pcXVlX21heF9pbl90aHJlc2hvbGRzO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGlzUnVubmluZ0luV2FsbHBhcGVyRW5naW5lKCkge1xuICAgIHJldHVybiB0eXBlb2Ygd2luZG93LndhbGxwYXBlciAhPT0gdW5kZWZpbmVkO1xufVxuY2xhc3MgQXVkaW9BcnJheVRvb2wge1xuICAgIGNvbnN0cnVjdG9yKGxlZnRfYXVkaW9fY2hhbm5lbHMsIHJpZ2h0X2F1ZGlvX2NoYW5uZWxzKSB7XG4gICAgICAgIHRoaXMubGVmdF9hdWRpb19jaGFubmVscyA9IGxlZnRfYXVkaW9fY2hhbm5lbHM7XG4gICAgICAgIHRoaXMucmlnaHRfYXVkaW9fY2hhbm5lbHMgPSByaWdodF9hdWRpb19jaGFubmVscztcbiAgICB9XG4gICAgZ2V0RnJvbUJhc3NMZWZ0QXVkaW9DaGFubmVsKGF1ZGlvX2FycmF5LCBjaGFubmVsX2NvdW50LCBzdGFydF9jaGFubmVsID0gMCkge1xuICAgICAgICBpZiAoY2hhbm5lbF9jb3VudCA9PSBudWxsKSB7XG4gICAgICAgICAgICByZXR1cm4gYXVkaW9fYXJyYXkuc2xpY2Uoc3RhcnRfY2hhbm5lbCwgdGhpcy5sZWZ0X2F1ZGlvX2NoYW5uZWxzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHN0YXJ0X2NoYW5uZWwgPSBNYXRoLm1pbihjaGFubmVsX2NvdW50LCBzdGFydF9jaGFubmVsKTtcbiAgICAgICAgICAgIGNoYW5uZWxfY291bnQgPSBNYXRoLm1pbihNYXRoLm1heChjaGFubmVsX2NvdW50LCBzdGFydF9jaGFubmVsKSwgdGhpcy5sZWZ0X2F1ZGlvX2NoYW5uZWxzKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhdWRpb19kYXRhID0gYXVkaW9fYXJyYXkuc2xpY2Uoc3RhcnRfY2hhbm5lbCwgY2hhbm5lbF9jb3VudCk7XG4gICAgICAgIHJldHVybiBhdWRpb19kYXRhO1xuICAgIH1cbn1cbmNvbnN0IGJwbV9kZXRlY3RvciA9IG5ldyBWb2x1bWVOb3JtYWxpemVkQlBNRGV0ZWN0b3IoODAsIDAuMTUpO1xuY29uc3QgYXVkaW9fYXJyYXlfdG9vbCA9IG5ldyBBdWRpb0FycmF5VG9vbCg2OCwgNjgpO1xubGV0IHVpX3dvcmtlciA9IHVuZGVmaW5lZDtcbmxldCBjdXJyZW50X2F1ZGlvX2RhdGEgPSAxO1xuZnVuY3Rpb24gd2FsbHBhcGVyQXVkaW9MaXN0ZW5lcihhdWRpb0FycmF5KSB7XG4gICAgLy8gZXZlcnkgMzAgZGF0YSBhc3N1bWluZyBhdWRpbyByZXNvbHV0aW9uIG9mIDMwIFwiZnBzXCJcbiAgICBpZiAoY3VycmVudF9hdWRpb19kYXRhICUgNiA9PSAwKSB7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjdXJyZW50X2F1ZGlvX2RhdGEgKz0gMTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjdXJyZW50X2F1ZGlvX2RhdGEgPSAxO1xuICAgIGNvbnN0IGJwbSA9IGJwbV9kZXRlY3Rvci5jYWxjdWxhdGVfYnBtKERhdGUubm93KCksIGF1ZGlvX2FycmF5X3Rvb2wuZ2V0RnJvbUJhc3NMZWZ0QXVkaW9DaGFubmVsKGF1ZGlvQXJyYXksIDM1LCAxNSkpO1xuICAgIGNvbnN0IG5leHRfYmVhdCA9IGJwbV9kZXRlY3Rvci5nZXRfdGltZV9vZmZfbmV4dF9iZWF0X2lmX2JwbV9jaGFuZ2VkKCk7XG4gICAgaWYgKHVpX3dvcmtlciAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgdWlfd29ya2VyLnBvc3RNZXNzYWdlKHsgbWVzc2FnZTogXCJicG1VcGRhdGVcIiwgYnBtOiBicG0sIG5leHRfYmVhdF90aW1lOiBuZXh0X2JlYXQgfSk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKFwiY3VycmVudCBicG06ICVkLCBuZXh0IGJlYXQgdGltZTogJWZcIiwgYnBtLCBuZXh0X2JlYXQpO1xufVxuZnVuY3Rpb24gYWRkX3dhbGxwYXBlcl9lbmdpbmVfYXVkaW9fbGlzdGVuaW5nKHVpV29ya2VyID0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGlzUnVubmluZ0luV2FsbHBhcGVyRW5naW5lKCkgJiYgXCJ3YWxscGFwZXJSZWdpc3RlckF1ZGlvTGlzdGVuZXJcIiBpbiB3aW5kb3cpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJhZGRpbmcgYXVkaW8gbGlzdGVuZXJcIik7XG4gICAgICAgIGNvbnN0IGF1ZGlvX2xpc3RlbmVyID0gd2luZG93LndhbGxwYXBlclJlZ2lzdGVyQXVkaW9MaXN0ZW5lcjtcbiAgICAgICAgYXVkaW9fbGlzdGVuZXIod2FsbHBhcGVyQXVkaW9MaXN0ZW5lcik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vdCBpbiB3YWxscGFwZXIgZW5naW5lXCIpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHNldF91aV93b3JrZXIocF91aV93b3JrZXIpIHtcbiAgICBpZiAocF91aV93b3JrZXIgPT0gbnVsbCkge1xuICAgICAgICB1aV93b3JrZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdWlfd29ya2VyID0gcF91aV93b3JrZXI7XG59XG5leHBvcnQgeyBzZXRfdWlfd29ya2VyLCBhZGRfd2FsbHBhcGVyX2VuZ2luZV9hdWRpb19saXN0ZW5pbmcsIFBlYWtEZXRlY3RvciwgQlBNRGV0ZWN0b3IgfTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==