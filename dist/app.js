"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default();
const login_1 = __importDefault(require("./routes/login"));
const signup_1 = __importDefault(require("./routes/signup"));
const shows_1 = __importDefault(require("./routes/shows"));
const movies_1 = __importDefault(require("./routes/movies"));
const watched_1 = __importDefault(require("./routes/watched"));
const show_1 = __importDefault(require("./routes/show"));
const movie_1 = __importDefault(require("./routes/movie"));
const episodes_1 = __importDefault(require("./routes/episodes"));
const database_1 = __importDefault(require("./util/database"));
const watcher_1 = __importDefault(require("./parser/watcher"));
const PORT_NUMBER = 3000;
app.use(express_1.default.static("./public"));
app.use(login_1.default);
app.use(signup_1.default);
app.use(shows_1.default);
app.use(movies_1.default);
app.use(watched_1.default);
app.use(show_1.default);
app.use(episodes_1.default);
app.use(movie_1.default);
app.get("/", (req, res, next) => {
    res.send("<p>REST API</p>");
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.sync({ force: true, logging: false });
    yield app.listen(PORT_NUMBER);
    watcher_1.default();
});
main();
