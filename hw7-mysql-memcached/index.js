/* library imports */
const express = require('express');

/* internal imports */
const database = require('./database');

/* app instance */
const app = express();
require('express-async-errors');

/* use json middleware */
app.use(express.json());

/* url to listen on */
const URL = { host: 'http://127.0.0.1', port: 5000 };

database.connect();

app.get('/hw7', async (req, res) => {
    let response = {"status": "error", "message": ""};

    const club = req.query['club'];
    const position = req.query['pos'];

    if(club === undefined || position == undefined) {
        response["message"] = "Fields 'club' or 'pos' is undefined in query."
        return res.json(response);
    }

    const assistStatistics = await database.getAssistStatistics(club, position);
    if(assistStatistics === null) {
        response["message"] = "Specified club or pos fields are invalid.";
        return res.json(response);
    }

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

app.listen(URL.port, URL.host, () => console.log(`Listening on ${URL.host}:${URL.port}...`));