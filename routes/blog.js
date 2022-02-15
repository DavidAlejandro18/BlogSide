//@ts-check
const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const ctrlBlog = require('../controllers/blog');
const { validarJWT, validarCampos, validarBaner } = require('../middlewares');

router.get('/', ctrlBlog.getPosts);

router.get('/:url?', ctrlBlog.getURLPost);

router.post('/create-post', [
    validarJWT,
    validarBaner,
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('content', 'El contenido es obligatorio').not().isEmpty(),
    validarCampos
], ctrlBlog.createPost);

module.exports = router;