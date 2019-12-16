"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
class RussianFetcher {
    getSeries(title) {
        const process = child_process_1.default.spawnSync('python3', ['main.py'], { encoding: 'utf-8' });
        if (process.stderr.length > 0)
            throw new Error(process.stderr);
        return process.stdout;
    }
}
exports.default = RussianFetcher;
try {
    const output = new RussianFetcher().getSeries("Hello");
    const data = JSON.parse(output);
    console.log(data);
}
catch (error) {
    console.log(error);
}
