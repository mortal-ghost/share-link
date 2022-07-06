const { application } = require('express');
const express = require('express');
const File = require('../models/file');
const router = express.Router();

router.get('/:uuid/share', async (req, res) => {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
        return res.status(404).render('error', {
            message: 'File not found',
            status: 404
        });
    }
    res.render('share', {
        url: `${process.env.APP_BASE_URL}/files/${file.uuid}`,
    });
});

router.get('/:uuid', async (req, res) => {
    try {
        const file = await File.findOne({
            uuid: req.params.uuid
        });

        if (!file) {
            return res.render('download', {
                error: 'Link has expired'
            });
        }

        return res.render('download', {
            uuid: file.uuid,
            filename: file.filename,
            size: file.size,
            download: `${process.env.APP_BASE_URL}/files/download/${file.uuid}`,
        });

    } catch (err) {
        res.render('download', {error: err});
    }
});


module.exports = router;