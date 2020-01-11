import express from 'express';
import login from './login';
import signup from './signup';
import shows from './shows';
import movies from './movies';
import watched from './watched';
import show from './show';
import movie from './movie';
import episodes from './episodes';
import next_episode from './next_episode';
import episode_timestamps from './episode_timestamps';

import path from 'path';

class RoutesManager {
    private readonly app = express();
    get PORT_NUMBER(): number {
        if (!process.env.PORT) throw new Error('Please speficy the PORT in the .env file');
        
        return parseInt(process.env.PORT); // 3000
    }

    private _port: number;

    constructor(portNumber?: number) {
        this._port = portNumber ?? this.PORT_NUMBER;

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
        this.app.use(next_episode);

        this.app.use(episode_timestamps);

        this.app.get("/", (req, res, next) => {
            res.send("<p>REST API</p>");
        });
    }

    async startServer() {
        await this.app.listen(this._port);
    }
}

export default RoutesManager;