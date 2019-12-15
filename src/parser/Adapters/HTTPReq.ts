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