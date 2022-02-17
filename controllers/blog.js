//@ts-check
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

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

    if(!archivosPermitidos.includes(extension)) {
        return res.status(400).json({
            msg: 'Extension no permitida'
        });
    }

    // SUBIMOS LA IMAGEN A CLOUDINARY
    const { tempFilePath } = baner;
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'baners' });

    // GUARDAMOS EL CONTENIDO DEL POST EN EL SERVIDOR
    const pathContent = path.join(__dirname, `../contents/${url}.html`);
    await fs.writeFile(pathContent, content, (err) => {
        if(err) {
            return res.status(500).json({
                msg: 'Error al guardar el contenido del post'
            });
        }
    });

    const newPost = new Post({
        titulo,
        url,
        content: `${url}.html`,
        baner: secure_url,
        creadoPor: req.usuario._id
    });

    await newPost.save();

    res.json(newPost);
}

module.exports = {
    getPosts,
    getURLPost,
    createPost
};