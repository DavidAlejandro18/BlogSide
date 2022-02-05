//@ts-check
const ctrlIndex = (req, res) => {
    res.render("index", {
        title: "BlogSide | Welcome",
        usuario: req.session.usuario,
        token: req.session.token
    });
}

const ctrlAbout = (req, res) => {
    res.send('About');
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

const ctrlDashboard = (req, res) => {
    res.render("dashboard", {
        title: "BlogSide | Dashboard",
        headerFrontendStatus: true,
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
    ctrlSettings,
    ctrlUsername,
    ctrlUsuariosLista
}