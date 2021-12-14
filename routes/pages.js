// @ts-check
const { Router } = require('express');
const router = Router();
const { validarLogin, validarPaginasUsuario, validarPaginaSuperUsuario } = require('../middlewares');
const controllerPages = require('../controllers/pages');

router.get('/', controllerPages.ctrlIndex);

router.get('/login', [
    validarLogin
], controllerPages.ctrlLogin);

router.get('/logout', controllerPages.ctrlLogout);

router.get('/dashboard', [
    validarPaginasUsuario
], controllerPages.ctrlDashboard);

router.get("/settings", [
    validarPaginasUsuario
], controllerPages.ctrlSettings);

router.get("/@:username?", controllerPages.ctrlUsername);

router.get('/usuarios-lista', [
    validarPaginaSuperUsuario
], controllerPages.ctrlUsuariosLista);

module.exports = router;