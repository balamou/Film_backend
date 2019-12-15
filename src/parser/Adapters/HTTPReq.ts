import http from 'http';
import syncRequest from 'sync-request';

export function httpGet(url: string) {
    var res = syncRequest('GET', url);
    
    const body = res.getBody('utf8');
    const bodyInJSONFormat = JSON.parse(body);

    return bodyInJSONFormat;
}

export const httpGetOLD = (url: string) => {
    return new Promise<any>((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const bodyInJSONFormat = JSON.parse(body);
                    resolve(bodyInJSONFormat);
                } catch {
                    reject('Decoding error');
                }
            });
        }).on('error', reject);
    });
};


import fs from 'fs';
import request from 'request';

// Example usage: 
// download('https://www.google.com/images/srpr/logo3w.png', 'google.png');

export const download = (uri: string, filename: string) => {
    return new Promise<string>((resolve, reject) => {
        request.head(uri, (err, res, body) => {
            if (err) reject(err);

            // handle content type
            const contentType = res.headers['content-type'];
            let finalName = filename;
            if (contentType) {
                const split = contentType.split('/');
                if (split.length >= 2) {
                    const ext = split[1];
                    finalName = `${filename}.${ext}`;
                }
            }

            request(uri).pipe(fs.createWriteStream(finalName)).on('close', () => resolve(finalName));
        });
    });
};