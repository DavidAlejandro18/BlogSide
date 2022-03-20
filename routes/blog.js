//@ts-check
const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const ctrlBlog = require('../controllers/blog');
const { validarJWT, validarCampos, validarBaner } = require('../middlewares');

router.get('/', ctrlBlog.getPosts);

router.get('/getInfoPost', [
    validarJWT,
    validarCampos
], ctrlBlog.getInfoPost);

router.get('/getTags', [
    check('termino', 'El termino de referencia es obligatorio').not().isEmpty(),
    validarCampos
], ctrlBlog.getTags);

router.get('/:url?', ctrlBlog.getURLPost);

router.post('/create-post', [
    validarJWT,
    validarBaner,
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('content', 'El contenido es obligatorio').not().isEmpty(),
    check('tags', 'Las etiquetas son obligatorias').not().isEmpty(),
    validarCampos
], ctrlBlog.createPost);

router.put('/edit-post', [
    validarJWT,
    check('id', 'El ID es obligatorio').isMongoId(),
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('content', 'El contenido es obligatorio').not().isEmpty(),
    check('tags', 'Las etiquetas son obligatorias').not().isEmpty(),
    validarCampos
], ctrlBlog.updatePost);

module.exports = router;