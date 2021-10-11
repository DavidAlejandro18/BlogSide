// @ts-check
const { Router } = require('express');
const router = Router();

// Obtener todos los usuarios
router.get('/', (req, res) => { 
    res.json({
        msg: 'get usuarios'
    });
});

// Obtener un usuario por id
router.get('/:id', (req, res) => {
    res.json({
        msg: 'get usuario ' + req.params.id
    });
});

// Crear un usuario
router.post('/', (req, res) => {
    res.json({
        msg: 'post usuario'
    });
});

// Actualizar un usuario
router.put('/:id', (req, res) => {
    res.json({
        msg: 'put usuario ' + req.params.id
    });
});

// Eliminar un usuario
router.delete('/:id', (req, res) => {
    res.json({
        msg: 'delete usuario ' + req.params.id
    });
});

module.exports = router;