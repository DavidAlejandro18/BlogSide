// @ts-check
const express = require('express');
const fileUpload = require('express-fileupload');
const hbs = require('hbs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dbConnection = require('../database/config');

class Server {
    constructor() {
        // TODO: express, cors, dotenv
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.paths = {
            usuarios: '/api/usuarios',
            auth: '/api/auth',
            blog: "/blog",
            tags: "/tags"
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
            },
            store: MongoStore.create({
                mongoUrl: process.env.MONGODB_CNN
            })
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
                // convert 2022-02-20T00:00:00.000Z to Saturday, February 19, 2022
                let date = new Date(value);
                let day = date.toLocaleString('default', { weekday: 'long' });
                let month = date.toLocaleString('default', { month: 'long' });
                let dayOfMonth = date.getDate();
                let year = date.getFullYear();

                day = day.charAt(0).toUpperCase() + day.slice(1);
                month = month.charAt(0).toUpperCase() + month.slice(1);

                return `${day}, ${month} ${dayOfMonth}, ${year}`;
            },
            json: function(value) {
                return JSON.stringify(value);
            },
            firstLetterUppercase: function(value) {
                return value.charAt(0).toUpperCase() + value.slice(1);
            },
            toString: function(array) {
                return array.toString();
            }
        });
    }

    routes() {
        this.app.use(this.paths.usuarios, require('../routes/usuarios'));
        this.app.use(this.paths.auth, require('../routes/auth'));
        this.app.use(this.paths.blog, require('../routes/blog'));
        this.app.use(this.paths.tags, require('../routes/tags'));
        this.app.use(require('../routes/pages'));
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

module.exports = Server;