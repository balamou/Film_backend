"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
class ffmpeg {
    // `destination` has to include the extension
    // returns path to the thumbnail if successfully extracted, otherwise undefined
    generateThumbnail(videoPath, destination, width = '600') {
        const args = ['-ss', '00:10:50', '-i', videoPath, '-vframes', '1', '-filter:v', 'scale=' + width + ':-1', destination];
        const process = child_process_1.default.spawnSync('ffmpeg', args, { encoding: 'utf-8' });
        const error = process.stderr;
        const reg = /Invalid data found when processing input/;
        if (reg.test(error))
            return undefined;
        return destination;
    }
    getDuration(videoPath) {
        const args = ['-i', videoPath, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'];
        const process = child_process_1.default.spawnSync('ffprobe', args, { encoding: 'utf-8' });
        const duration = process.stdout.toString().replace(/\r?\n|\r/g, '');
        const actualDuration = parseInt(duration);
        return isNaN(actualDuration) ? undefined : actualDuration;
    }
    // returns `true` if the video is not damaged
    isVideoNotDamaged(videoPath) {
        const args = ['-i', videoPath];
        const process = child_process_1.default.spawnSync('ffmpeg', args, { encoding: 'utf-8' });
        const error = process.stderr;
        const reg = /Invalid data found when processing input/;
        if (reg.test(error))
            return false;
        return true;
    }
}
exports.default = ffmpeg;
