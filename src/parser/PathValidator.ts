class PathData {
    constructor(public fullPath: string,
        public rootDirectory: string,
        public language: string,
        public type: string,
        public name: string) { }

    root = () => `${this.rootDirectory}/${this.language}/${this.type}`;
}

class PathValidator {
    private WRONG_DIRECTORY = 'Not the right directory';
    private WRONG_LANGUAGE = 'No language directory found';
    private WRONG_TYPE = 'Has to be in a`shows` or`movies` directory';

    parsePath(path: string) {
        const pathComponents = path.split('/'); // example: [ 'public', 'en', 'shows', 'rick_and_morty' ]

        const language = pathComponents[1];
        const type = pathComponents[2];

        if (pathComponents.length < 4) throw new Error(this.WRONG_DIRECTORY);
        if (!(language === 'en' || language === 'ru')) throw new Error(this.WRONG_LANGUAGE);
        if (!(type === 'shows' || type === 'movies')) throw new Error(this.WRONG_TYPE);

        return new PathData(path, pathComponents[0], pathComponents[1], pathComponents[2], pathComponents[3]);
    }
}

export default PathValidator;