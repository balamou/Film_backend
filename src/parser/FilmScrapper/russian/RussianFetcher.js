"use strict";
exports.__esModule = true;
var child_process_1 = require("child_process");
var RussianFetcher = /** @class */ (function () {
    function RussianFetcher() {
    }
    RussianFetcher.prototype.execScript = function (title) {
        var process = child_process_1["default"].spawnSync('python3', ['main.py', 'rick\ and\ morty'], { encoding: 'utf-8' });
        if (process.stderr.length > 0)
            throw new Error(process.stderr);
        return process.stdout;
    };
    RussianFetcher.prototype.getSeries = function (title) {
        try {
            var output = this.execScript(title);
            var seriesData = JSON.parse(output);
            console.log(seriesData);
            return seriesData;
        }
        catch (error) {
            var pythonError = error.message;
            console.log(pythonError);
        }
    };
    return RussianFetcher;
}());
exports["default"] = RussianFetcher;
new RussianFetcher().getSeries("Rick and morty");
