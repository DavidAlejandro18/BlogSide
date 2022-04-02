//@ts-check
const Post = require('../models/post');
const { isValidObjectId } = require("mongoose");
const path = require('path');
const fs = require('fs');

const ctrlIndex = async (req, res) => {
    const posts = await Post.find({ estado: "2" }).limit(10).select("-_id -estado").sort({ createdAt: "desc" }).populate('creadoPor', 'username -_id');

    res.render("index", {
        title: "BlogSide",
        usuario: req.session.usuario,
        token: req.session.token,
        posts
    });
}

const ctrlAbout = (req, res) => {
    res.render('about', {
        title: 'BlogSide | Acerca de mí',
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

    if(!fs.existsSync(path.join(__dirname, `../contents/${urlContent}`)) || (dataPost.estado != "2" && !req.session.token)) {
        return res.status(404).render('404', {
            title: 'BlogSide | Página no encontrada'
        });
    } else {
        contentHTML = fs.readFileSync(path.join(__dirname, `../contents/${urlContent}`), 'utf8');
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