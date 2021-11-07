const bcrypt = require('bcryptjs');
const Usuario = require("../models/usuario");

const login = async (req, res) => {
    const { correo, password } = req.body;

    const usuario = await Usuario.findOne({ correo, estado: true }).select('-createdAt -updatedAt');

    if (!usuario) {
        return res.status(400).json({
            msg: `La cuenta con el correo '${correo}' no existe. Por favor, crea una cuenta.`
        });
    }

    let verificarPassword = bcrypt.compareSync(password, usuario.password);
    if(!verificarPassword) {
        return res.status(400).json({
            msg: `La contraseña es incorrecta.`
        });
    }

    res.status(200).json({
        usuario
    });
}

module.exports = {
    login
}