// @ts-check
const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const dbConnection = require('../database/config');

class Server {
    constructor() {
        // TODO: express, cors, dotenv
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.paths = {
            usuarios: '/api/usuarios',
            auth: '/api/auth',
            blog: "/blog"
        };
        this.secret_session = process.env.SECRET_SESSION;

        this.conectarDB();

        this.middlewares();

        this.handlebars();

        this.routes();
    }

    async conectarDB() {
        await dbConnection();
    }

    middlewares() {
        this.app.use(session({
            secret: this.secret_session,
            resave: false,
            name: 'user',
            proxy: true,
            saveUninitialized: true,
            cookie: {
                secure: false, 
                path: '/',
                maxAge: 4 * 60 * 60 * 1000,
                httpOnly: true
            }
        }));
        
        this.app.use(cors());

        this.app.use(express.json());

        this.app.use(express.static('public'));

        this.app.use(fileUpload({
            useTempFiles : true,
            tempFileDir : '/tmp/',
            createParentPath: true
        }));
    }

    handlebars() {
        this.app.set("view engine", "hbs");
        hbs.registerPartials(path.join(__dirname, "../", "/views/partials"));
        
        // @ts-ignore
        hbs.registerHelper({
            ifEquals: function(arg1, arg2, options) {
                return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
            },
            switch: function(value, options) {
                this.switch_value = value;
                this.switch_break = false;
                return options.fn(this);
            },
            case: function(value, options) {
                // @ts-ignore
                if (value == this.switch_value) {
                    this.switch_break = true;
                    return options.fn(this);
                }
            },
            default: function(value, options) {
                // @ts-ignore
                if (this.switch_break == false) {
                    return value;
                }
            },
            prettyDate: function(value, options) {
                let date = new Date(value);

                let day = date.getDate();
                let month = date.getMonth() + 1;
                let year = date.getFullYear();

                let hours = date.getHours(); 
                let minutes = date.getMinutes();

                let date_format = `${day}/${month}/${year}`;
                let time_format = `${hours}:${minutes}`;

                return `${date_format} a las ${time_format} horas`;
            }
        });
    }

    routes() {
        this.app.use(this.paths.usuarios, require('../routes/usuarios'));
        this.app.use(this.paths.auth, require('../routes/auth'));
        this.app.use(this.paths.blog, require('../routes/blog'));
        this.app.use(require('../routes/pages'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

module.exports = Server;