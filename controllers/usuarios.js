// @ts-check
const { response } = require("express");
const Usuario = require("../models/usuario");
const { generateUsername } = require("../helpers/functions");

const obtenerUsuarios = async (req, res = response) => {
    const { limit = 5, from = 0 } = req.query;
    const usuarios = await Usuario.find({
        estado: true
    }).skip(Number(from)).limit(Number(limit)).select('-createdAt -updatedAt');

    res.json({
        total: usuarios.length,
        result: usuarios
    });
};

const obtenerUsuario = async (req, res = response) => {
    let id = req.params.id;

    const usuario = await Usuario.findById(id).select('-createdAt -updatedAt');

    res.json(usuario);
};

const crearUsuario = async (req, res = response) => {
    let { nombre, correo, password } = req.body;

    let username = generateUsername(nombre);

    const usuario = new Usuario({
        nombre,
        correo,
        password,
        username
    });

    await usuario.save();

    res.json({
        usuario
    });
};

const actualizarUsario = async (req, res = response) => {
    const id = req.params.id;
    // EXTRAEMOS LOS DATOS QUE NO QUEREMOS QUE SE ACTUALICEN EN LA BD EN CASO DE PROPORCIONARLOS 
    // Y AL FINAL DEJAMOS SOLO LOS QUE QUEREMOS QUE SE ACTUALICEN (...datos)
    const { _id, username, role, estado, google, createdAt, updatedAt, __v, ...datos } = req.body;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, datos);

    res.json({
        usuario: usuarioActualizado
    });
};

const eliminarUsusario = async (req, res = response) => {
    let id = req.params.id;

    const usuarioActualizado = await Usuario.findByIdAndUpdate(id, {
        estado: false
    });

    res.json({
        usuario: usuarioActualizado
    });
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuario,
    crearUsuario,
    actualizarUsario,
    eliminarUsusario
};