const express = require('express');
const path = require('path');

class Server {
    constructor() {
        // TODO: express, cors, dotenv
        this.app = express();
        this.port = process.env.PORT || 3000;

        this.middlewares();
    }

    middlewares() {
        this.app.use(express.json());

        this.app.use(express.static(path.join(__dirname, '../public')));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

module.exports = Server;