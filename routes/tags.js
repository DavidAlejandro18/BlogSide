// @ts-check
const { Router } = require('express');
const router = Router();
const ctrlTags = require('../controllers/tags');

router.get('/', ctrlTags.getTags);

router.get('/:tag', ctrlTags.getTag);

module.exports = router;