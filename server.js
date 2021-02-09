const aws = require('aws-sdk');
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const uuid = require('uuid').v4;
const path = require('path');
const MongoClient = require('mongodb').MongoClient;

const app = express();

MongoClient.connect('mongodb://localhost', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(client => {
        console.log('Mongo Connected!');
        const db = client.db('myApp');
        const collection = db.collection('images');
        app.locals.imageCollection = collection;
    })

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
// Needs AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY

const upload = multer({
    storage: multerS3({
        s3,
        acl: 'public-read',
        bucket: 'jdc-test-upload',
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            cb(null, `${uuid()}${ext}`);
        }
    })
});

app.use(express.static('public'))

app.post('/upload', upload.single('appImage'), (req, res) => {
    const imageCollection = req.app.locals.imageCollection;
    const uploadedFile = req.file.location;
    imageCollection.insert({ filePath: uploadedFile })
        .then(result => {
            return res.json({ status: 'OK', ...result });
        })
});

app.get('/images', (req, res) => {
    const imageCollection = req.app.locals.imageCollection;
    imageCollection.find({})
        .toArray()
        .then(images => {
            const paths = images.map(({ filePath }) => ({ filePath}) );
            res.json(paths);
        });
});expo

app.listen(3001, () => console.log('App listening on 3001'));