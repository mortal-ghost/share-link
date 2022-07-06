const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const File = require('../models/file');
const { v4: uuidv4 } = require('uuid');
const sendMail = require('../services/emailService');
const emailTemplate = require('../services/emailTemplate');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

let upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000 * 100
    },
}).single('file');

router.post('/', (req, res) => {

    upload(req, res, async (err) => {
        if (!req.file) {
            return res.render('error', {
                message: 'No file uploaded'
            });
        }

        if (err) {
            console.log(err);
            return res.status(400).render('error', {
                message: 'File too large',
                status: 400
            });
        } 
        
        const file = new File({
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            uuid: uuidv4(),
        });

        const response = await file.save();

        return res.status(200).redirect(`/files/${response.uuid}/share`);
    });
});

router.post('/send', async  (req, res) =>  {
    const { uuid, emailTo, emailFrom } = req.body;
    if (!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({
            error: 'All fields are required'
        });
    }

    const file = await File.findOne({
        uuid: uuid
    });

    if (file.sender) {
        return res.status(400).send({
            error: 'File already sent'
        });
    }

    
    const response = await file.save();
    
    // send email
    sendMail({
        to: emailTo,
        from: emailFrom,
        subject: 'File transfer',
        text: `${emailFrom} has sent you a file.`,
        html: emailTemplate({
            emailFrom: emailFrom,
            downloadLink: `${process.env.APP_BASE_URL}/files/download/${uuid}`,
            size: parseInt(response.size / 1000) + ' KB',
            filename: response.filename,
            expires: `less than 24 hours`
        }),
    });

    file.sender = emailFrom;
    file.recipient = emailTo;

    return res.send({   
        success: true,
    });
});

module.exports = router;