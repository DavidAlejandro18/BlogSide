//@ts-check
const { model, Schema } = require('mongoose');

const PostSchema = new Schema({
    titulo: {
        type: String,
        required: [
            true,
            'El titulo es obligatorio'
        ]
    },
    resumen: {
        type: String,
        required: [
            true,
            'El resumen es obligatorio'
        ],
        maxLength: 150
    },
    baner: {
        type: String,
        required: [
            true,
            'El el url del baner es obligatorio'
        ]
    },
    content: {
        type: String,
        required: [
            true,
            'El nombre del archivo txt es obligatorio'
        ]
    },
    url: {
        type: String,
        required: [
            true,
            'El url es obligatorio'
        ]
    },
    creadoPor: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    estado: {
        type: String,
        required: true,
        default: 1,
        emun: [0, 1, 2] // 0: eliminado, 1: revisión, 2: aprobado
    },
    tags: [String]
}, {
    timestamps: true
});

PostSchema.methods.toJSON = function() {
    const { _id, __v, ...post } = this.toObject();
    post.uid = _id;
    return post;
}

module.exports = model('Post', PostSchema);