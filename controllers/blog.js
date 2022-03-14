//@ts-check
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const Post = require('../models/post');
const Tag = require('../models/tags');

const getPosts = (req, res) => {
    res.send("Vamos a ver todos los post");
}

const getInfoPost = async (req, res) => {
    const { status, limit, orderBy } = req.query;
    let query = {};

    if(status != "all") {
        query.estado = status;
    }

    if(isNaN(limit)) {
        return res.status(400).json({
            msg: 'El limite debe ser un número entero'
        });
    }

    if(!["asc", "desc", "ascending", "descending", "1", "-1"].includes(orderBy)) {
        return res.status(400).json({
            msg: 'El orden deben ser alguno de estos valores: [asc, desc, ascending, descending, 1, -1]'
        });
    }

    let posts = await Post.find(query).limit(Number(limit)).sort({ createdAt: orderBy }).populate('creadoPor', 'username -_id').select("-_id");

    res.json({
        total: posts.length,
        posts
    });
}

const getTags = async (req, res) => {
    const { termino } = req.query;
    const regex = new RegExp(termino, 'i');

    let tags = await Tag.find({ tag: regex }).select('tag -_id');
    tags = tags.map(tag => tag.tag);

    res.json({
        termino,
        tags
    });
}

const getURLPost = async (req, res) => {
    const { url } = req.params;
    const post = await Post.find({ url }).populate('creadoPor', 'nombre img correo -_id').select('-_id').lean();

    if(!post[0]) {
        return res.status(404).render('404', {
            title: 'BlogSide | Página no encontrada'
        });
    }

    const { content: urlContent, ...dataPost } = post[0];
    let contentHTML = '';

    if(!fs.existsSync(path.join(__dirname, `../contents/${urlContent}`)) || (dataPost.estado != "2" && !req.session.token)) {
        return res.status(404).render('404', {
            title: 'BlogSide | Página no encontrada'
        });
    } else {
        contentHTML = fs.readFileSync(path.join(__dirname, `../contents/${urlContent}`), 'utf8');
        contentHTML = contentHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    }

    res.render('post', {
        title: `BlogSide | ${dataPost.titulo}`,
        contentHTML,
        dataPost
    });
}

const createPost = async (req, res) => {

    let archivosPermitidos = ['png', 'jpg', 'jpeg', 'gif'];

    // OBTENEMOS EL TITULO Y EL CONTENIDO
    let { titulo, content, tags } = req.body;

    // GENERAMOS EL URL PERSONALIZADO
    let url = titulo.split(' ').join('-').toLowerCase();
    url = url.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // SUSTITUIMOS LOS ACENTOS CON LETRAS NORMALES
    url = url.replace(/[^a-z0-9-]/g, ''); // ELIMINAMOS LOS CARACTERES ESPECIALES

    // VERIFICAMOS SI EXISTE EL URL
    let existeURL = await Post.countDocuments({ url });

    if(existeURL > 0) {
        return res.status(400).json({
            msg: 'Este titulo ya existe'
        });
    }

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

    // SUBIMOS LA IMAGEN DEL BANER A CLOUDINARY
    const { tempFilePath } = baner;
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'baners' }, (err) => {
        if(err) {
            return res.status(500).json({
                msg: 'Error al subir la imagen -> ' + err.message
            });
        }
    });

    // GUARDAMOS LAS IMAGENES DEL CONTENIDO EN CLOUDINARY
    const imgs = content.match(/<img[^>]+>/g);

    if(imgs) {
        await Promise.all(imgs.map(async (img) => {
            let base64 = img.match(/src="[^"]+"/g)[0].replace(/src="|"/g, '');
    
            if (base64.substr(0, 4) != 'http') {
                const { secure_url: secure_url_image_post } = await cloudinary.uploader.upload(base64, { folder: 'posts' }, (err) => {
                    if(err) {
                        return res.status(500).json({
                            msg: 'Error al subir la imagen del contenido -> ' + err.message
                        });
                    }
                });
    
                content = content.replace(`src="${base64}"`, `src="${secure_url_image_post}"`);
            }
        }));
    }
    
    // GUARDAMOS EL CONTENIDO DEL POST EN EL SERVIDOR
    const pathContent = path.join(__dirname, `../contents/${url}.html`);
    await fs.writeFile(pathContent, content, (err) => {
        if(err) {
            return res.status(500).json({
                msg: 'Error al guardar el contenido del post'
            });
        }
    });

    // GENERAMOS EL ARRAY DE LOS TAGS
    tags = tags.split(',').map(tag => {
        tag = tag.trim().toLowerCase(); // ELIMINAMOS LOS ESPACIOS DE ADELANTE Y ATRAS DE CADA TAG Y LO CONVERTIMOS A MINUSCULAS
        tag = tag.replace(/\s/g, '-'); // REEMPLAZAMOS LOS ESPACIOS ENTRE LETRAS POR GUIONES

        return tag;
    });

    tags = [...new Set(tags)]; // Eliminamos los duplicados

    // GUARDAMOS CADA TAG EN LA TABLA DE TAGS
    await Promise.all(tags.map(async (tag) => {
        const existeTag = await Tag.countDocuments({ tag });

        if(existeTag == 0) {
            const newTag = new Tag({
                tag
            });

            await newTag.save();
        }
    })).catch(err => {
        return res.status(500).json({
            msg: 'Error al guardar los tags'
        });
    });

    const newPost = new Post({
        titulo,
        url,
        content: `${url}.html`,
        baner: secure_url,
        creadoPor: req.usuario._id,
        tags
    });

    await newPost.save();

    res.json(newPost);
}

module.exports = {
    getPosts,
    getInfoPost,
    getTags,
    getURLPost,
    createPost
};