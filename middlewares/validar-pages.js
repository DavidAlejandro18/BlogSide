const validarLogin = (req, res, next) => {
    if (req.session.usuario) {
        res.redirect('/');
    } else {
        next();
    }
}

const validarPaginasUsuario = (req, res, next) => {
    if (req.session.usuario) {
        next();
    } else {
        res.redirect('/login');
    }
}

const validarPaginaSuperUsuario = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.role == "SUPREME_ADMIN_ROLE") {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = {
    validarLogin,
    validarPaginasUsuario,
    validarPaginaSuperUsuario
};