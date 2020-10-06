const express = require('express');
const multer = require('multer');
const path = require('path');
const uuid = require('uuid').v4;
const app = express();
const mongoose = require('mongoose');
const Image = require('./models/Image');

mongoose.connect('mongodb://127.0.0.1', { useNewUrlParser: true, useUnifiedTopology: true });
// const connection = mongoose.connection;
// connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads')
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const id = uuid();
        const filePath = `images/${id}${ext}`;
        Image.create({ filePath: filePath })
            .then(() => {
                cb(null, filePath)
            });
    }
})
const upload = multer({ storage }); // or simply { dest: 'uploads/' }
app.use(express.static('public'));
app.use(express.static('uploads'));

app.post('/upload', upload.array('avatar'), (req, res) => {
    return res.redirect('/');
});

app.get('/images', (req, res) => {
    Image.find()
        .then((images) => {
            return res.json({ status: 'OK', images});
        })
});

app.listen(3001);