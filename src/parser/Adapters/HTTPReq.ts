import http from 'http';

export const httpGet = (url: string) => {
    return new Promise((resolve, reject) => {
        http.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const bodyInJSONFormat = JSON.parse(body);
                resolve(bodyInJSONFormat);
            });
        }).on('error', reject);
    });
};