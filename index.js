const express = require('express');
const app = express();
const Redis = require('ioredis');
const path = require('path');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');

const redis = new Redis();
redis.on('ready', () => {
    console.log('Redis Connected!!!');
});

app.use(fileUpload({
    createParentPath: true
}));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.static(__dirname + '/index.html'));

app.listen(5000, () => {
    console.log(`Example app listening at http://localhost:5000`);
});

app.get('*', function routeHandler(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/mouseEvents', function routeHandler(req, res) {
    console.log("I come here", req.body)
    redis.hmset("Events", Date.now(), req.body, (err, res) => {

    });
    res.send('success save data in redis');
});

app.post('/saveScreenshot', async function saveScreenshot(req, res) {
    const { vendorId, date } = req.body;
    let screenshot = req.files.screenshot;
    screenshot.mv('./uploads/screenshots/' + screenshot.name, err => {
        if (err) {
            return res.status(500).send(err);
        }
        const data = JSON.stringify({ 'date': req.body.date, 'vendorId': req.body.vendorId, 'imageUrl': `uploads/screenshots/${screenshot.name}` });
        redis.hmset("Screenshot", vendorId, data);
    });

    res.send({
        status: true,
        message: 'File is uploaded',
        data: {
            name: screenshot.name,
            mimetype: screenshot.mimetype,
            size: screenshot.size
        }
    });
});