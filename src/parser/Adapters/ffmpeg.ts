import cprocess from 'child_process';

export default class ffmpeg {

    // `destination` has to include the extension
    // returns path to the thumbnail if successfully extracted, otherwise undefined
    generateThumbnail(videoPath: string, destination: string, width: string = '600'): string | undefined {
        const args = ['-ss', '00:10:50', '-i', videoPath, '-vframes', '1', '-filter:v', 'scale=' + width + ':-1', destination];
        const process = cprocess.spawnSync('ffmpeg', args, { encoding: 'utf-8' });
        
        const error = process.stderr;
        const reg = /Invalid data found when processing input/;
        if (reg.test(error)) return undefined;
        
        return destination;
    }

    getDuration(videoPath: string): number | undefined {
        const args = ['-i', videoPath, '-show_entries', 'format=duration', '-v', 'quiet', '-of', 'csv=p=0'];
        const process = cprocess.spawnSync('ffprobe', args, { encoding: 'utf-8' });
        const duration = process.stdout.toString().replace(/\r?\n|\r/g, '');

        const actualDuration = parseInt(duration);
        return isNaN(actualDuration) ? undefined : actualDuration;
    }
}
