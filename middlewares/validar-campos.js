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

const validarBaner = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0 || !req.files.baner) { // REVISA SI NO HAY ARCHIVOS EN LA REQUEST, MANDA UN STATUS 400 Y UN MENSAJE DE ERROR
        return res.status(400).json({
            msg: 'No hay archivo que subir'
        });
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
    validarBaner,
    existeCorreo,
    existeUsuario
};