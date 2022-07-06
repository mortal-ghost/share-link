const express = require('express');
const router = express.Router();
const File = require('../models/file');

router.get('/:uuid', (req, res) => {
    try {
        File.findOne({
            uuid: req.params.uuid
        }).then(file => {
            if (!file) {
                return res.render('download', {
                    error: 'Link has expired'
                });
            }

            const filePath = `${__dirname}/../${file.path}`;

            res.download(filePath);
        });
    } catch (err) {
        return res.render('download', {error: err});
    }
});

module.exports = router;