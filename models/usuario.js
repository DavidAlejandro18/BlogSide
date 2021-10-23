// @ts-check
const { model, Schema } = require('mongoose');

// GENERATE USERNAME BY FIELD NAME

const UsuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [
            true,
            'El nombre es obligatorio'
        ]
    },
    username: {
        type: String,
        required: [
            true,
            'El username es obligatorio'
        ],
        unique: true
    },
    correo: {
        type: String,
        required: [
            true,
            'El correo es obligatorio'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [
            true,
            'La contraseña es obligatorio'
        ]
    },
    img: {
        type: String,
    },
    role: {
        type: String,
        required: true,
        default: 'USER_ROLE',
        emun: ['SUPREME_ADMIN_ROLE', 'USER_ROLE']
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true // agrega los campos createdAt y updatedAt
});

UsuarioSchema.methods.toJSON = function() {
    const { _id, __v, password, ...usuario } = this.toObject();
    usuario.uid = _id;
    return usuario;
}

module.exports = model('Usuario', UsuarioSchema);