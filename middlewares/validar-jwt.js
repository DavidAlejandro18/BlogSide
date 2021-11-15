//@ts-check
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const validarJWT = async (req, res, next) => {
    const token = req.headers["x-token"];
    
    // VERIFICAMOS SI HAY UN TOKEN EN LA PETICIÓN
    if(!token) {
        return res.status(401).json({
            msg: "Token not found"
        });
    }

    // VERIFICAMOS SI EL TOKEN ES VALIDO
    try {
        
        // EXTRAEMOS EL ID DEL USUARIO DEL PAYLOAD
        // @ts-ignore
        const { uid } = jwt.verify(token, process.env.SECRET_KEY_JWT);

        const usuario = await Usuario.findById(uid);

        // VERIFICAMOS SI EL USUARIO EXISTE
        if(!usuario || !usuario.estado) {
            return res.status(401).json({
                msg: "User not found"
            });
        }

        // MANDAMOS LA INFO DEL USUARIO POR LA REQUEST PARA RECIBIRLA DESPUES EN EL CONTROLADOR
        req.usuario = usuario;

        next();
    } catch (error) {
        res.status(401).json({
            msg: "Token invalid"
        });
    }
}

module.exports = {
    validarJWT
}