// @ts-check
const { validationResult } = require('express-validator');
const Usuario = require('../models/usuario');
const ObjectId = require('mongoose').Types.ObjectId;

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

    next();
}

const existeCorreo = async (correo) => {
    const existeCorreo = await Usuario.findOne({ correo });

    if(existeCorreo) {
        throw new Error(`El correo '${correo}' ya esta registrado. Intenta iniciar sesión.`);
    }
}

const existeUsuario = async (idUsuario) => {
    const existeUsuario = await Usuario.findOne({
        // @ts-ignore
        _id: ObjectId(idUsuario),
        estado: true
    });
    
    if(!existeUsuario) {
        throw new Error(`El usuario con id '${idUsuario}' no existe.`);
    }
}

module.exports = {
    validarCampos,
    existeCorreo,
    existeUsuario
};