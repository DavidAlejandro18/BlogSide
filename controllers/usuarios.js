// @ts-check
const { response } = require("express");

const obtenerUsuarios = (req, res = response) => {
    res.json({
        msg: 'get usuarios'
    });
};

const obtenerUsuario = (req, res = response) => {
    let id = req.params.id;

    res.json({
        msg: `get usuario ${id}`
    });
};

const crearUsuario = (req, res = response) => {
    let body = req.body;

    res.json({
        msg: 'crear usuario',
        body
    });
};

const actualizarUsario = (req, res = response) => {
    let id = req.params.id;

    res.json({
        msg: `actualizar usuario ${id}`
    });
};

const eliminarUsusario = (req, res = response) => {
    let id = req.params.id;

    res.json({
        msg: `eliminar usuario ${id}`
    });
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsario,
    eliminarUsusario
};