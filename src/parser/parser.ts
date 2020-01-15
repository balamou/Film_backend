import parseSingleMovie from './one-script-parser/parse_single_movie';
import parseSingleShow from './one-script-parser/parse_single_show';

function validate(args: string[]) {
    if (args.length !== 5) {
        console.log("Wrong amount of arguments.");
        console.log("The comman is: node parser.ts <language> <type> <path>");
        return;
    }

    let language = args[2];
    let type = args[3];
    let path = args[4];

    if (!(language === 'en' || language === 'ru')) {
        console.log('The first argument has to be the language (\'en\' or \'ru\').');
        return;
    }

    if (!(type === 'movie' || type === 'show')) {
        console.log('The second argument has to be the type of the video (\'movie\' or \'show\')');
        return;
    }

    return {
        language: language,
        type: type,
        path: path
    };
}

function parse() {
    const parameters = validate(process.argv);
    if (!parameters) return;

    if (parameters.type === 'movie') {
        parseSingleMovie(parameters.language, parameters.path);
    } else if (parameters.type === 'show') {
        parseSingleShow(parameters.language, parameters.path);
    }
}

parse();
