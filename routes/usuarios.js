// @ts-check
const { Router } = require('express');
const router = Router();
const ctrlUsuario = require('../controllers/usuarios');

// Obtener todos los usuarios
router.get('/', ctrlUsuario.obtenerUsuarios);

// Obtener un usuario por id
router.get('/:id', ctrlUsuario.obtenerUsuario);

// Crear un usuario
router.post('/', ctrlUsuario.crearUsuario);

// Actualizar un usuario
router.put('/:id', ctrlUsuario.actualizarUsario);

// Eliminar un usuario
router.delete('/:id', ctrlUsuario.eliminarUsusario);

module.exports = router;