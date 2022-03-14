//@ts-check
const { model, Schema } = require('mongoose');

const TagSchema = new Schema({
    tag: {
        type: String,
        required: [
            true,
            'El tag es obligatorio'
        ],
        unique: true
    }
}, {
    timestamps: true
});

TagSchema.methods.toJSON = function() {
    const { _id, __v, ...post } = this.toObject();
    post.uid = _id;
    return post;
}

module.exports = model('Tag', TagSchema);