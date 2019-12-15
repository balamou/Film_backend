import cprocess from 'child_process';

export default class ffmpeg {

    // `destination` has to include the extension
    takeThumbnail(videoPath: string, destination: string) {
        const width = '500';
        const args = ['-ss', '00:10:50', '-i', videoPath, '-vframes', '1', '-filter:v', 'scale=' + width + ':-1', destination];
        cprocess.spawnSync('ffmpeg', args);
    }

    getDuration(videoPath: string): number {
        const args = ['-i', videoPath, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'];
        const process = cprocess.spawnSync('ffprobe', args, { encoding: 'utf-8' });
        const duration = process.stdout.toString().replace(/\r?\n|\r/g, '');

        return parseInt(duration);
    }
}