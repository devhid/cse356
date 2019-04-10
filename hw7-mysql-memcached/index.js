/* library imports */
const express = require('express');
const mysql = require('mysql2');

/* internal imports */
const database = require('./database');

/* app instance */
const app = express();
require('express-async-errors');

/* use json middleware */
app.use(express.json());

/* db vars */
const connectionOptions = { user: 'root' };
let connection = null;

/* url to listen on */
const URL = { host: 'http://127.0.0.1', port: 5000 };

connect();

app.get('/hw7', async (req, res) => {
    let response = {"status": "error", "message": ""};

    const club = req.query['club'];
    const position = req.query['pos'];

    if(club === undefined || position == undefined) {
        response["message"] = "Fields 'club' or 'pos' is undefined in query."
        return res.json(response);
    }

    const assistStatistics = await database.getAssistStatistics(connection, club, position);
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

function connect() {
    connection = mysql.createConnection(connectionOptions);
  
    connection.connect(function(err) {
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }
      
        console.log('Connected as id ' + connection.threadId);
    });
}

app.listen(URL.port, URL.host, () => console.log(`Listening on ${URL.host}:${URL.port}...`));