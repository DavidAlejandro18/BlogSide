//@ts-check
const axios = require('axios').default;
const cloudinary = require('cloudinary').v2;
cloudinary.config(process.env.CLOUDINARY_URL);

const Post = require('../models/post');
const Tag = require('../models/tags');
const archivosPermitidos = ['png', 'jpg', 'jpeg', 'gif'];

const getPosts = (req, res) => {
    res.render('blog', {
        title: 'BlogSide | Blog',
        usuario: req.session.usuario,
        token: req.session.token
    })
}

const getInfoPost = async (req, res) => {
    const { text, status, limit, orderBy } = req.query;
    let query = {};

    if(text) {
        // buscar con regex titulos o si incluye en el array de tags y que el estado sea igual a status
        const regex = new RegExp(text, 'i');
        // @ts-ignore
        query = {
            $or: [
                { titulo: regex },
                {
                    tags: { $in: [regex] }
                },
            ]
        };
        if(status && status != "all") {
            query.$and = [
                { estado: status }
            ]
        }
    } else {
        if(status != "all") {
            query.estado = status;
        }
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

    let posts = await Post.find(query).limit(Number(limit)).sort({ createdAt: orderBy }).populate('creadoPor', 'username -_id');

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

const getResult = async (req, res) => {
    const { search } = req.query;
    let query = {};

    if(search.length > 0) {
        let regex = new RegExp(search, 'i');
        // @ts-ignore
        query = {
            $or: [
                { titulo: regex },
                {
                    tags: { $in: [regex] }
                },
            ],
            $and: [
                { estado: "2" }
            ]
        };
    } else {
        query.estado = "2";
    }

    const posts = await Post.find(query).select("-_id -estado").sort({ createdAt: "desc" }).populate('creadoPor', 'username -_id');

    res.json({
        posts
    });
}

const getURLPost = async (req, res) => {
    const { url } = req.params;
    const post = await Post.find({ url }).populate('creadoPor', 'nombre img correo -_id').select('-_id').lean();

    try {
        if(!post[0]) {
            return res.status(404).render('404', {
                title: 'BlogSide | Página no encontrada'
            });
        }
    
        const { content: urlContent, ...dataPost } = post[0];
        let contentHTML = '';
    
        const fileContent = await axios.get(`${process.env.URL_CLOUD}contents/${urlContent}`);
        if(fileContent.status != 200 || (dataPost.estado != "2" && !req.session.token)) {
            return res.status(404).render('404', {
                title: 'BlogSide | Página no encontrada'
            });
        } else {
            contentHTML = fileContent.data;
            contentHTML = contentHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
        }
    
        res.render('post', {
            title: `BlogSide | ${dataPost.titulo}`,
            contentHTML,
            dataPost
        });
    } catch (error) {
        return res.status(404).render('404', {
            title: 'BlogSide | Página no encontrada'
        });
    }
}

const createPost = async (req, res) => {

    // OBTENEMOS EL TITULO Y EL CONTENIDO
    let { titulo, resumen, content, tags } = req.body;

    // GENERAMOS EL URL PERSONALIZADO
    let url = titulo.split(' ').join('-').toLowerCase();
    url = url.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // SUSTITUIMOS LOS ACENTOS CON LETRAS NORMALES
    url = url.replace(/[^a-z0-9-]/g, ''); // ELIMINAMOS LOS CARACTERES ESPECIALES

    try {
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
        const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'baners' });

        // GUARDAMOS LAS IMAGENES DEL CONTENIDO EN CLOUDINARY
        const imgs = content.match(/<img[^>]+>/g);
    
        if(imgs) {
            await Promise.all(imgs.map(async (img) => {
                let base64 = img.match(/src="[^"]+"/g)[0].replace(/src="|"/g, '');
        
                if (base64.substr(0, 4) != 'http') {
                    const { secure_url: secure_url_image_post } = await cloudinary.uploader.upload(base64, { folder: 'posts' });
                    content = content.replace(`src="${base64}"`, `src="${secure_url_image_post}"`);
                }
            }));
        }
        
        // GUARDAMOS EL CONTENIDO DEL POST EN EL SERVIDOR
        const dataCloud = new URLSearchParams();
        dataCloud.append('nameFile', `${url}.html`);
        dataCloud.append('content', content);
        await axios.post(`${process.env.URL_CLOUD}api/save-content.php`,
            dataCloud,
            {
                headers: {
                    'x-token': process.env.CLOUD_TOKEN
                }
            }
        );
        
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
        }));

        // CREAMOS UNA NUEVA INSTANCIA DEL POST
        const newPost = new Post({
            titulo,
            resumen,
            url,
            content: `${url}.html`,
            baner: secure_url,
            creadoPor: req.usuario._id,
            tags
        });

        // GUARDAMOS EL POST EN LA BASE DE DATOS
        await newPost.save();
    
        // RETORNAMOS LA RESPUESTA
        res.json(newPost);
    } catch (error) {
        res.status(500).json({
            msg: 'Hubo un error al crear el post -> ' + error.message
        });   
    }
}

const updatePost = async (req, res) => {
    try {
        let { id, titulo, resumen, content, tags }  = req.body;
        let newDataPost = {}

        // OBTENEMOS EL POST
        let post = await Post.findById(id).populate('creadoPor', 'username -_id').lean();

        // SI HAY UN NUEVO BANER, O SUBIMOS A CLOUDINARY Y GUARDAMOS EL NUEVO ENLACE
        if (req.files && req.files.baner) {
            const baner = req.files.baner;
    
            // OBTENEMOS LA EXTENSIÓN DEL ARCHIVO
            const nombreCortado = baner.name.split('.');
            const extension = nombreCortado[nombreCortado.length - 1];
        
            if(!archivosPermitidos.includes(extension)) {
                return res.status(400).json({
                    msg: 'El archivo para el baner no es valida'
                });
            }

            // SUBIMOS LA NUEVA IMAGEN DEL BANER A CLOUDINARY
            const { tempFilePath } = baner;
            const { secure_url } = await cloudinary.uploader.upload(tempFilePath, { folder: 'baners' });
            
            // ELIMINAMOS LA IMAGEN ACTUAL DEL BANER DE CLOUDINARY
            const [ baner_image_id ] = (post.baner.split('/')).pop().split("."); 
            await cloudinary.uploader.destroy("baners/" + baner_image_id);

            newDataPost.baner = secure_url;
        }

        // REESCRIBIMOS LA URL DEL POST MEDIANTE EL NUEVO TITULO
        let url = titulo.split(' ').join('-').toLowerCase();
        url = url.normalize('NFD').replace(/[\u0300-\u036f]/g, ""); // SUSTITUIMOS LOS ACENTOS CON LETRAS NORMALES
        url = url.replace(/[^a-z0-9-]/g, ''); // ELIMINAMOS LOS CARACTERES ESPECIALES
        newDataPost.url = url;

        // GUARDAMOS LAS IMAGENES DEL CONTENIDO EN CLOUDINARY
        const imgs = content.match(/<img[^>]+>/g);
    
        if(imgs) {
            await Promise.all(imgs.map(async (img) => {
                let base64 = img.match(/src="[^"]+"/g)[0].replace(/src="|"/g, '');
        
                if (base64.substr(0, 4) != 'http') {
                    const { secure_url: secure_url_image_post } = await cloudinary.uploader.upload(base64, { folder: 'posts' });
        
                    content = content.replace(`src="${base64}"`, `src="${secure_url_image_post}"`);
                }
            }));
        }

        // REESCRIBIMOS EL CONTENIDO DEL ARCHIVO HTML
        const dataCloud = new URLSearchParams();
        dataCloud.append('nameFile', post.content);
        dataCloud.append('content', content);
        await axios.post(`${process.env.URL_CLOUD}api/save-content.php`,
            dataCloud,
            {
                headers: {
                    'x-token': process.env.CLOUD_TOKEN
                }
            }
        );
        
        // GENERAMOS EL ARRAY DE LOS NUEVOS TAGS
        tags = tags.split(',').map(tag => {
            tag = tag.trim().toLowerCase();
            tag = tag.replace(/\s/g, '-');
    
            return tag;
        });
    
        tags = [...new Set(tags)]; // Eliminamos los duplicados
        newDataPost.tags = tags;

        // GUARDAMOS NUEVOS TAGS EN LA TABLA DE TAGS (EN CASO DE QUE HAYAN NUEVOS)
        await Promise.all(tags.map(async (tag) => {
            const existeTag = await Tag.countDocuments({ tag });

            if(existeTag == 0) {
                const newTag = new Tag({
                    tag
                });

                await newTag.save();
            }
        }));

        newDataPost.titulo = titulo;
        newDataPost.resumen = resumen;

        // ACTUALIZAMOS EL POST
        await Post.findByIdAndUpdate(id, newDataPost, { new: true });

        res.json({
            msg: 'Post actualizado correctamente',
            url
        });

    } catch (error) {
        res.status(500).json({
            msg: "Hubo un error al editar el post -> " + error.message
        });
    }
}

const changeStatus = async (req, res) => {
    try {

        const { id, estado } = req.body;

        await Post.findByIdAndUpdate(id, { estado }, { new: true });

        res.json({
            msg: 'Estado del post actualizado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
}

module.exports = {
    getPosts,
    getInfoPost,
    getTags,
    getResult,
    getURLPost,
    createPost,
    updatePost,
    changeStatus
};