class BPMDetector {
    private p_d: PeakDetector;
    private e_values: { is_beat: boolean; point_in_time_ms: number; energy: number }[];
    private default_bpm: number;
    private kept_entry_count: number = 50;
    private needed_difference: number;
    private max_bpm: number;

    constructor(default_bpm: number, needed_difference: number = 0.3, max_bpm = 200) {
        this.p_d = new PeakDetector();
        this.e_values = [];
        this.default_bpm = default_bpm;
        this.needed_difference = needed_difference;
        this.max_bpm = max_bpm;
    }

    public calculate_bpm(
        time_ms: number,
        audio_data: number[],
        needed_difference: number | undefined = undefined
    ): number {
        this.remove_old_entries();
        let large_energy_change: { is_peak: boolean; value: number };
        if (needed_difference === undefined) {
            large_energy_change = this.p_d.detect_large_energy_changes(
                audio_data,
                this.needed_difference
            );
        } else {
            large_energy_change = this.p_d.detect_large_energy_changes(
                audio_data,
                needed_difference
            );
        }
        console.log("energy data %o at time_ms %d", large_energy_change, time_ms);
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
        this.default_bpm = Math.min(bpm, this.max_bpm);
        return Math.min(bpm, this.max_bpm);
    }

    private get_last_beat(): {
        point_in_time_ms: number;
        energy: number;
    } | null {
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

    private remove_old_entries() {
        if (this.e_values.length >= this.kept_entry_count) {
            console.log("Removing old entries");
            // const filtered_peaks = this.e_values.filter((values, i, arr) => {
            //     return values.is_beat;
            // });
            let last_beat_index: number | undefined;
            console.log("old %o", this.e_values);
            for (const [index, energy_value] of this.e_values.entries()) {
                if (energy_value.is_beat) {
                    last_beat_index = index;
                }
            }
            if (last_beat_index === undefined) {
                last_beat_index = this.e_values.length - 1;
            }
            this.e_values = this.e_values.slice(last_beat_index, this.kept_entry_count);
            console.log("new %o", this.e_values);
        }
    }
}

class VolumeNormalizedBPMDetector extends BPMDetector {
    private current_audio_average: number;
    private average_relative_needed_difference: number;
    private last_bpms: { time_ms: number; bpm: number }[];
    private beat_change_after_seconds: number;

    constructor(
        default_bpm: number,
        average_relative_needed_difference: number = 0.5,
        max_bpm = 200
    ) {
        super(default_bpm, average_relative_needed_difference, max_bpm);
        this.average_relative_needed_difference = average_relative_needed_difference;
        this.current_audio_average = 0.5;
        this.last_bpms = [];
        this.beat_change_after_seconds = 0.15;
    }

    public calculate_bpm(time_ms: number, audio_data: number[]): number {
        // Doesn't work great because of internal rms
        const sum = audio_data.reduce((pre, cur_val, ind, arr) => pre + Math.min(cur_val, 1.0));
        // console.log("sum %f", sum);
        const average = (sum + this.current_audio_average) / (audio_data.length + 1);
        const average_with_offset = average + (1 / 10) * this.current_audio_average;
        // TODO try out different normalization
        const audio_data_normalized: number[] = audio_data.map(
            (val, i, arr) => val / average_with_offset
        );
        this.current_audio_average = average_with_offset;
        // console.log("Calculated average %f", average_with_offset);
        // const needed_difference =
        //     this.average_relative_needed_difference * this.current_audio_average;
        const bpm = super.calculate_bpm(
            time_ms,
            audio_data_normalized,
            this.average_relative_needed_difference
        );
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
    last_RMS: number;

    constructor(last_RMS: number = 0) {
        this.last_RMS = last_RMS;
    }

    public detect_large_energy_changes(
        arr: number[],
        needed_difference: number = 0.3
    ): { is_peak: boolean; value: number } {
        const current_RMS = this.calculate_RootMeanSquare(arr, this.last_RMS);
        console.log("current RMS %f", current_RMS);
        const is_new_rms_peak: boolean = current_RMS - needed_difference > this.last_RMS;
        this.last_RMS = current_RMS;
        return { value: current_RMS, is_peak: is_new_rms_peak };
    }

    public calculate_RootMeanSquare(arr: number[], last_RMS: number = 0) {
        const pow_of_2_sum = arr.reduce((p, c, ind, arr) => {
            const normalized_val = Math.min(c, 1.0);
            return p + Math.pow(normalized_val, 2);
        }, 0);
        const rms = Math.sqrt((pow_of_2_sum + last_RMS) / (arr.length + 1));
        return rms;
    }

    public find_max_indices(
        arr: number[],
        max_threshold: number = 0.1
    ): { index: number; value: number }[] {
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
        const absolute_max = <{ index: number; value: number }>indexed_ascending_peaks.pop();
        const unique_max_in_thresholds = indexed_ascending_peaks.filter((value, ind, arr) => {
            return (
                absolute_max.value != value.value &&
                absolute_max.value - value.value <= max_threshold
            );
        });
        unique_max_in_thresholds.push(absolute_max);
        return unique_max_in_thresholds;
    }
}

function isRunningInWallpaperEngine(): boolean {
    return typeof (window as any).wallpaper !== undefined;
}

class AudioArrayTool {
    private left_audio_channels: number;
    private right_audio_channels: number;

    constructor(left_audio_channels: number, right_audio_channels: number) {
        this.left_audio_channels = left_audio_channels;
        this.right_audio_channels = right_audio_channels;
    }

    public getFromBassLeftAudioChannel(
        audio_array: number[],
        channel_count: number | null,
        start_channel: number = 0
    ): number[] {
        if (channel_count == null) {
            return audio_array.slice(start_channel, this.left_audio_channels);
        } else {
            start_channel = Math.min(channel_count, start_channel);
            channel_count = Math.min(
                Math.max(channel_count, start_channel),
                this.left_audio_channels
            );
        }
        const audio_data = audio_array.slice(start_channel, channel_count);
        console.log("the audio data %o", audio_data);
        return audio_data;
    }
}

const bpm_detector = new VolumeNormalizedBPMDetector(80, 0.15);
const audio_array_tool = new AudioArrayTool(68, 68);
let current_audio_data = 1;

function wallpaperAudioListener(audioArray: number[]): void {
    // every 30 data assuming audio resolution of 30 "fps"
    if (current_audio_data % 6 == 0) {
    } else {
        current_audio_data += 1;
        return;
    }
    current_audio_data = 1;
    const bpm = bpm_detector.calculate_bpm(
        Date.now(),
        audio_array_tool.getFromBassLeftAudioChannel(audioArray, 35, 15)
    );
    console.log("current bpm: %d", bpm);
}

function add_wallpaper_engine_audio_listening() {
    if (isRunningInWallpaperEngine() && "wallpaperRegisterAudioListener" in window) {
        console.log("adding audio listener");
        const audio_listener = window.wallpaperRegisterAudioListener as (
            callback: (audioArray: number[]) => void
        ) => void;
        audio_listener(wallpaperAudioListener);
    } else {
        console.log("not in wallpaper engine");
    }
}

export { add_wallpaper_engine_audio_listening, PeakDetector, BPMDetector };
