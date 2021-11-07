const { Router } = require('express');
const { check } = require('express-validator');
const { login } = require('../controllers/auth');
const { validarCampos } = require('../middlewares');
const router = Router();

router.post('/login', [
    check('correo', 'El correo es requerido').isEmail(),
    check('password', 'El password es requerido').not().isEmpty(),
    validarCampos
], login);

module.exports = router;