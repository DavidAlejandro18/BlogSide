const validarCampos = require('./validar-campos');
const validarJWT = require('./validar-jwt');
const validarUsuarioGlobal = require('./validar-pages');

module.exports = {
    ...validarCampos,
    ...validarJWT,
    ...validarUsuarioGlobal
};