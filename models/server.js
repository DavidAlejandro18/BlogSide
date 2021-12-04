// @ts-check
const express = require('express');
const hbs = require('hbs');
const path = require('path');
const cors = require('cors');
const dbConnection = require('../database/config');

class Server {
    constructor() {
        // TODO: express, cors, dotenv
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.paths = {
            usuarios: '/api/usuarios',
            auth: '/api/auth'
        };

        this.conectarDB();

        this.middlewares();

        this.handlebars();

        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }

    middlewares() {
        this.app.use(cors());

        this.app.use(express.json());

        this.app.use(express.static('public'));
    }

    handlebars() {
        this.app.set("view engine", "hbs");
        hbs.registerPartials(path.join(__dirname, "../", "/views/partials"));
    }

    routes() {
        this.app.use(require('../routes/pages'));
        this.app.use(this.paths.usuarios, require('../routes/usuarios'));
        this.app.use(this.paths.auth, require('../routes/auth'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

module.exports = Server;