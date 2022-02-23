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
    const allPost = await Post.find({}).select("-_id").populate('creadoPor', 'username -_id');
    const postDeleted = allPost.filter(post => post.estado === "0");
    const postReview = allPost.filter(post => post.estado === "1");
    const postAccepted = allPost.filter(post => post.estado === "2");
    
    res.render("dashboard", {
        title: "BlogSide | Dashboard",
        usuario: req.session.usuario,
        token: req.session.token,
        allPost,
        postDeleted,
        postReview,
        postAccepted
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