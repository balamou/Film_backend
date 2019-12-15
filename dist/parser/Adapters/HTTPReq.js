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
                const bodyInJSONFormat = JSON.parse(body);
                resolve(bodyInJSONFormat);
            });
        }).on('error', reject);
    });
};
