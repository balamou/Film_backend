import express from 'express';
import login from './login';
import signup from './signup';
import shows from './shows';
import movies from './movies';
import watched from './watched';
import show from './show';
import movie from './movie';
import episodes from './episodes';

import path from 'path';

class RoutesManager {
    private readonly app = express();
    private readonly PORT_NUMBER: number;

    constructor(portNumber: number = 3000) {
        this.PORT_NUMBER = portNumber;

        const staticPath = path.join(__dirname, '../../public');

        this.app.use(express.static(staticPath));

        this.app.use(login);
        this.app.use(signup);

        this.app.use(shows);
        this.app.use(movies);
        this.app.use(watched);

        this.app.use(show);
        this.app.use(episodes);

        this.app.use(movie);

        this.app.get("/", (req, res, next) => {
            res.send("<p>REST API</p>");
        });
    }

    async startServer() {
        await this.app.listen(this.PORT_NUMBER);
    }
}

export default RoutesManager;