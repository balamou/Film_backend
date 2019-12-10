"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PathData {
    constructor(fullPath, rootDirectory, language, type, name) {
        this.fullPath = fullPath;
        this.rootDirectory = rootDirectory;
        this.language = language;
        this.type = type;
        this.name = name;
        this.root = () => `${this.rootDirectory}/${this.language}/${this.type}`;
    }
}
class PathValidator {
    constructor() {
        this.WRONG_DIRECTORY = 'Not the right directory';
        this.WRONG_LANGUAGE = 'No language directory found';
        this.WRONG_TYPE = 'Has to be in a`shows` or`movies` directory';
    }
    parsePath(path) {
        const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]
        const language = pathComponents[1];
        const type = pathComponents[2];
        if (pathComponents.length < 4)
            throw new Error(this.WRONG_DIRECTORY);
        if (!(language === 'en' || language === 'ru'))
            throw new Error(this.WRONG_LANGUAGE);
        if (!(type === 'shows' || type === 'movies'))
            throw new Error(this.WRONG_TYPE);
        return new PathData(path, pathComponents[0], pathComponents[1], pathComponents[2], pathComponents[3]);
    }
}
exports.default = PathValidator;
