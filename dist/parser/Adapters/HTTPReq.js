"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
exports.httpGet = (url) => {
    return new Promise((resolve, reject) => {
        http_1.default.get(url, res => {
            res.setEncoding('utf8');
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const bodyInJSONFormat = JSON.parse(body);
                    resolve(bodyInJSONFormat);
                }
                catch (_a) {
                    reject('Decoding error');
                }
            });
        }).on('error', reject);
    });
};
const fs_1 = __importDefault(require("fs"));
const request_1 = __importDefault(require("request"));
// Example usage: 
// download('https://www.google.com/images/srpr/logo3w.png', 'google.png');
exports.download = (uri, filename) => {
    return new Promise((resolve, reject) => {
        request_1.default.head(uri, (err, res, body) => {
            if (err)
                reject(err);
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
            request_1.default(uri).pipe(fs_1.default.createWriteStream(finalName)).on('close', () => resolve(finalName));
        });
    });
};
