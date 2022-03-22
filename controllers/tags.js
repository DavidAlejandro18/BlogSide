// @ts-check
const Post = require('../models/post');
const Tag = require('../models/tags');

const getTags = async (req, res) => {
    try {
        let tags = await Tag.find({}).select("-_id -__v");
    
        tags = tags.map(item => item.tag);

        //res.send("Vamos a mostrar los tags");
        res.render("tags", {
            usuario: req.session.usuario,
            token: req.session.token,
            tags
        })

    } catch (error) {
        res.status(500).send(error);
    }
}

const getTag = async (req, res) => {
    const { tag } = req.params;

    const post = await Post.find({
        $and: [
            { estado: "1" },
            { tags: { $in: [tag] } }
        ]
    }).select("-_id -__v");
    
    res.render("tags", {
        usuario: req.session.usuario,
        token: req.session.token,
        tag,
        post
    })
}

module.exports = {
    getTags,
    getTag
}