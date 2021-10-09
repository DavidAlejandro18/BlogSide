require('dotenv').config();

const { Server } = require('./models/'); // Desestructuracion
const server = new Server();

server.listen();