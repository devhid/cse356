/* library imports */
const express = require('express');
const cassandra = require('cassandra-driver');
const multer = require('multer');

/* initialize app */
const app = express();
require('express-async-errors');

/* handle json data better */
app.use(express.json());

/* port to listen on */
const PORT = 5000;

/* client connection options */
const connectionOptions = { 
    contactPoints: ["127.0.0.1"], 
    localDataCenter: 'datacenter1', 
    keyspace: "hw5" 
};

/* initialize cassandra client */
const client = new cassandra.Client(connectionOptions);

/* image upload destination */
const upload = multer();

/* connect to cassandra database */
client.connect().then(() => console.log(`[+] Successfully established connection to keyspace, '${connectionOptions.keyspace}'.`));

app.post('/deposit', upload.single('contents'), async (req, res) => {
    const filename = req.body['filename'];
    const contents = req.file.buffer;
    const mimetype = req.file.mimetype;

    deposit(filename, contents, mimetype);

    return res.json({"status": "OK"});
});

app.get('/retrieve', async (req, res) => {
    const filename = req.body['filename'];
    const image = await retrieve(filename).catch((error) => res.json({"error": error}));

    res.set('Content-Type', image.mimetype);
    res.send(image.contents);
});

function deposit(filename, contents, mimetype) {
    const query = `INSERT INTO ${connectionOptions.keyspace}.imgs (filename, contents, mimetype) VALUES (?, ?, ?)`;
    client.execute(query, [filename, contents, mimetype]);
}

async function retrieve(filename) {
    const query = 'SELECT filename, contents, mimetype FROM hw5.imgs WHERE filename = ?';
    return new Promise( (resolve, reject) => {
        client.execute(query, [filename], { prepare: true}, (error, result) => {
            if(error) {
                reject("Error in executing query.");
            } else {
                const row = result.first();
                if(row == null) {
                    reject("Could not find row matching that filename.");
                    return;
                }
                resolve({"filename" : row.filename, "contents": row.contents, "mimetype": row.mimetype});
            }
        });
    });
}

app.listen(PORT, '127.0.0.1', () => console.log(`Listening on http://127.0.0.1:${PORT}...`));
