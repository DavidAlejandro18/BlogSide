//@ts-check
const Post = require('../models/post');

const ctrlIndex = (req, res) => {
    res.render("index", {
        title: "BlogSide",
        usuario: req.session.usuario,
        token: req.session.token
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
    ctrlSettings,
    ctrlUsername,
    ctrlUsuariosLista
}