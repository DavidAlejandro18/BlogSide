//@ts-check
const Post = require('../models/post');
const { isValidObjectId } = require("mongoose");
const axios = require('axios').default;

const ctrlIndex = async (req, res) => {
    const posts = await Post.find({ estado: "2" }).limit(10).select("-_id -estado").sort({ createdAt: "desc" }).populate('creadoPor', 'username -_id');

    const dataSEO = {
        resumen: "BlogSide es un pequeño blog creado con el objetivo de compartir conocimientos, retos y experiencias de programación.",
        tags: ["blog", "code", "consejos", "programación"],
        pagina: "",
        img: "https://blogside.herokuapp.com/img/BlogSide%20Dark.png"
    };

    res.render("index", {
        title: "BlogSide",
        usuario: req.session.usuario,
        token: req.session.token,
        dataSEO,
        posts
    });
}

const ctrlAbout = (req, res) => {
    const dataSEO = {
        resumen: "BlogSide es un pequeño blog creado con el objetivo de compartir conocimientos, retos y experiencias de programación.",
        tags: ["blog", "David Tovar", "me", "about me"],
        pagina: "about",
        img: "https://blogside.herokuapp.com/img/me.jpeg"
    };

    res.render('about', {
        title: 'BlogSide | Acerca de mí',
        dataSEO
    });
}

const ctrlLogin = (req, res) => {
    res.render("login", {
        title: "BlogSide | Login",
    })
}

const ctrlLogout = (req, res) => {
    req.session.destroy();
    res.redirect('/');
}

const ctrlDashboard = async (req, res) => {
    res.render("dashboard", {
        title: "BlogSide | Dashboard",
        usuario: req.session.usuario,
        token: req.session.token
    });
}

const ctrlCreatePost = (req, res) => {
    res.render('createPost', {
        title: 'BlogSide | Crear nuevo post',
        usuario: req.session.usuario,
        token: req.session.token
    });
}

const ctrlEditPost = async (req, res) => {
    const { id } = req.params;
    const isValid = isValidObjectId(id);

    if(!isValid) {
        return res.redirect('/dashboard');
    }

    const post = await Post.findById(id).lean();

    const { content: urlContent, ...dataPost } = post;
    let contentHTML = '';

    const fileContent = await axios.get(`${process.env.URL_CLOUD}contents/${urlContent}`);
    if(fileContent.status != 200 || (dataPost.estado != "2" && !req.session.token)) {
        return res.status(404).render('404', {
            title: 'BlogSide | Página no encontrada'
        });
    } else {
        contentHTML = fileContent.data;
    }

    res.render('editPost', {
        title: 'BlogSide | Editar post',
        usuario: req.session.usuario,
        token: req.session.token,
        dataPost,
        contentHTML
    });
}

const ctrlSettings = (req, res) => {
    res.send("Settings");
}

const ctrlUsername = (req, res) => {
    res.send('Usuario: '+ req.params.username);
}

const ctrlUsuariosLista = (req, res) => {
    res.send('Lista de usuarios a los que podemos eliminar o modificar');
}


module.exports = {
    ctrlIndex,
    ctrlAbout,
    ctrlLogin,
    ctrlLogout,
    ctrlDashboard,
    ctrlCreatePost,
    ctrlEditPost,
    ctrlSettings,
    ctrlUsername,
    ctrlUsuariosLista
}