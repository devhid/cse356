/**
 * GP: Games Played, 
 * GS: Games Started, 
 * A: Assists, 
 * GWA: Game-Winning Assists
 * HmA:
 * RdA: 
 * A/90min: Assists / 90 Minutes
 */

const mysql = require('mysql');

const connectionOptions = {
    user: 'root',
    database: "hw7"
};

const connection = mysql.createConnection(connectionOptions);
  
connection.connect(function(err) {
    if (err) {
        console.error('error connecting: ' + err.stack);
        return;
    }
  
    console.log('Connected as id ' + connection.threadId);
});

async function getAssistStatistics(club, position) {
    const query = "select player, a, gs from assists where club = ? and pos = ?";

    return new Promise((resolve, reject) => {
        connection.query(query, [club, position], function(error, results, fields) {
            if(error) {
                console.log("[DEBUG] : Query encountered an error.");
                reject(error);
            } else {
                if(results.length == 0) {
                    console.log("[DEBUG] : Results array is empty.");
                    console.log(fields);
                    resolve(null);
                } else {
                    /* calculate max assists, avg assists, and player who scored the most assists */
                    let max_assists = 0;
                    let avg_assists = 0;
                    let player = results[0];

                    console.log(`[DEBUG]: Initialized field, 'max_assists' = ${max_assists}.`);
                    console.log(`[DEBUG]: Initialized field, 'avg_assists' = ${avg_assists}.`);
                    console.log(`[DEBUG] Initialized field, 'player' = ${player}.`);

                    console.log("[DEBUG] : Starting to calculate statistics...");
                    for(let result of results) {
                        if(result.a === max_assists) {
                            console.log("[DEBUG] result.assists === max_assists.");
                            console.log(`[DEBUG] Field, 'result.gs' = ${result.gs}`);
                            console.log(`[DEBUG] Field, 'player.gs' = ${player.gs}`);

                            player = (result.gs > player.gs) ? result : player;

                            console.log(`[DEBUG] Field, 'player' = ${player}.`);
                        }

                        if(result.a > max_assists) {
                            console.log("[DEBUG] result.assists > result.max_assists.");

                            max_assists = result.a;
                            player = result;

                            console.log(`[DEBUG]: Field, 'max_assists' = ${max_assists}.`);
                            console.log(`[DEBUG]: Field, 'player' = ${player}.`);
                        }

                        avg_assists += result.a;
                        console.log(`[DEBUG]: Field, 'avg_assists' = ${avg_assists}.`);
                    }

                    avg_assists = avg_assists / results.length;
                    player = player.player;

                    console.log(`[DEBUG]: Field, 'avg_assists' = ${avg_assists}.`);
                    console.log(`[DEBUG]: Field, 'player' = ${player}.`);

                    let stats = {
                        "club": club,
                        "pos": position,
                        "max_assists": max_assists,
                        "player": JSON_stringify(player, true).replace(/\"/g, ''),
                        "avg_assists": avg_assists
                    }

                    resolve(stats);
                }
            }
        })
    });
}

function JSON_stringify(s, emit_unicode)
{
   var json = JSON.stringify(s);
   return emit_unicode ? json : json.replace(/[\u007f-\uffff]/g,
      function(c) { 
        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
      }
   );
}

module.exports = {
    getAssistStatistics: getAssistStatistics
}
 