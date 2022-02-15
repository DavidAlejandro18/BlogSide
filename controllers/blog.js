//@ts-check
const { v4: uuidv4 } = require('uuid');
const Post = require('../models/post');

const getPosts = (req, res) => {
    res.send("Vamos a ver todos los post");
}

const getURLPost = (req, res) => {
    res.send("Obtenemos el post con la url: " + req.params.url);
}

const createPost = async (req, res) => {

    let archivosPermitidos = ['png', 'jpg', 'jpeg', 'gif'];

    // OBTENEMOS EL TITULO Y EL CONTENIDO
    const { titulo, content } = req.body;

    // GENERAMOS EL URL PERSONALIZADO
    let url = titulo.split(' ').join('-').toLowerCase();
    url = url.replace(/[^a-z0-9-]/g, '');

    // OBTENEMOS LA IMAGEN DEL BANER
    const baner = req.files.baner;

    // OBTENEMOS LA EXTENSIÓN DEL ARCHIVO
    const nombreCortado = baner.name.split('.');
    const extension = nombreCortado[nombreCortado.length - 1];

    const newNameImage = `${uuidv4()}.${extension}`;

    const newPost = new Post({
        titulo,
        url,
        content,
        baner: newNameImage,
        creadoPor: req.usuario._id
    });

    await newPost.save();

    // TO-DO
    // falta mover la imagen al path correcto
    // y guardar el contenido en un archivo txt
    // generar el nombre y cuando termine de guardar
    // mover el archivo a la carpeta correcta
    // y guardar unicamente el nombre del archivo en la BD

    res.json(newPost);
}

module.exports = {
    getPosts,
    getURLPost,
    createPost
};