/* library imports */
const express = require('express');
const memcached = require('memcached')("127.0.0.1:11211");

/* internal imports */
const database = require('./database');

/* app instance */
const app = express();
require('express-async-errors');

/* use json middleware */
app.use(express.json());

/* url to listen on */
const URL = { host: '127.0.0.1', port: 5000 };

app.get('/hw7', async (req, res) => {
    let response = {"status": "error", "message": ""};

    const club = req.query['club'];
    const position = req.query['pos'];

    if(club === undefined || position == undefined) {
        response["message"] = "Fields 'club' or 'pos' is undefined in query."
        return res.json(response);
    }

    const key = club + "|" + pos;

    const cache = await getCache(key);
    if(cache != null) {
        return res.json(cache);
    }

    const assistStatistics = await database.getAssistStatistics(club, position);
    if(assistStatistics === null) {
        response["message"] = "Specified club or pos fields are invalid.";
        return res.json(response);
    }
    
    memcached.add(key, assistStatistics, 60, (err) => console.log(err));

    res.json(assistStatistics);
});

function generateOK() {
    return {
        "club": "",
        "pos": "",
        "max_assists": 0,
        "player": "",
        "avg_assists": 0
    };
}

async function getCache(key) {
    return new Promise((resolve, reject) => {
        memcached.get(key, (err, data) => {
            if(err) {
                resolve(null);
            } else {
                resolve(data);
            }
        });
    });
}

app.listen(URL.port, URL.host, () => console.log(`Listening on http://${URL.host}:${URL.port}...`));