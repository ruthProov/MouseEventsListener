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

app.get('/getHeatmap', function getHeatmap(req, res) {
    res.send({ url: 'http://localhost:5000/uploads/screenshots/sreenshot_123456789_1643626758404.png' });
});

app.get('/getMouseEvents', async (req, res) => {
    const data = await redis.hgetall("Events");
    res.send(data);
});

app.get('*', function routeHandler(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/mouseEvents', function routeHandler(req, res) {
    if (req.body.length > 0) {
        redis.hmset("Events", Date.now(), JSON.stringify(req.body), (err, res) => {

        });
        res.send('success save data in redis');
    }
    res.send("no data");
});

app.post('/saveScreenshot', async function saveScreenshot(req, res) {
    const { vendorId, date } = req.body;
    let screenshot = req.files.screenshot;
    screenshot.mv('./uploads/screenshots/' + screenshot.name, err => {
        if (err) {
            return res.status(500).send(err);
        }
        const data = JSON.stringify({ 'date': req.body.date, 'vendorId': req.body.vendorId, 'imageUrl': `uploads/screenshots/${screenshot.name}` });
        redis.hmset("Screenshot", vendorId, data, (result) => {
            console.log(result);
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
    });

});

app.delete('/reset', async (req, res) => {
    console.log("delete");
    await redis.del("Events");
    res.send({status:200})
});