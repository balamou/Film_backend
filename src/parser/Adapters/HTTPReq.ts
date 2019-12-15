import http from 'http';

export const httpGet = (url: string) => {
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
    return new Promise<void>((resolve, reject) => {
        request.head(uri, (err, res, body) => {
            console.log('content-type:', res.headers['content-type']);
            console.log('content-length:', res.headers['content-length']);

            if (err) reject(err);

            request(uri).pipe(fs.createWriteStream(filename)).on('close', () => resolve());
        });
    });
};