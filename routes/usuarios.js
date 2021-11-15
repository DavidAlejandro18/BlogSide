// @ts-check
const { Router } = require('express');
const { check } = require('express-validator');
const router = Router();
const ctrlUsuario = require('../controllers/usuarios');
const { validarCampos, existeCorreo, existeUsuario, validarJWT } = require('../middlewares');

// Obtener todos los usuarios
router.get('/', [
    validarJWT,
    validarCampos
], ctrlUsuario.obtenerUsuarios);

// Obtener un usuario por id
router.get('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id', 'No se encontró el usuario').custom(existeUsuario),
    validarCampos
], ctrlUsuario.obtenerUsuario);

// Crear un usuario
router.post('/', [
    validarJWT,
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'La contraseña es obligatoria').isLength({ min: 6 }),
    check('correo', 'El email es obligatorio').isEmail(),
    check('correo', 'El email debe ser único').custom(existeCorreo),
    validarCampos
], ctrlUsuario.crearUsuario);

// Actualizar un usuario
router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    check('id', 'No se encontró el usuario').custom(existeUsuario),
    check('nombre', 'El nombre es obligatorio').optional().not().isEmpty(),
    check('password', 'La contraseña es obligatoria').optional().isLength({ min: 6 }),
    check('correo', 'El email es obligatorio').optional().isEmail(),
    //check('correo', 'El email debe ser único').optional().custom(existeCorreo),
    validarCampos
], ctrlUsuario.actualizarUsario);

// Eliminar un usuario
router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], ctrlUsuario.eliminarUsuario);

module.exports = router;