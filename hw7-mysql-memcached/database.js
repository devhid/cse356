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

async function getAssistStatisticsDebug(club, position) {
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
                    results.sort((a,b) => (a.player > b.player) ? 1 : ((b.player > a.player) ? -1 : 0));
                    /* calculate max assists, avg assists, and player who scored the most assists */
                    let max_assists = 0;
                    let avg_assists = 0;
                    let player = results[0];

                    console.log(results);

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
                            if(result.gs === player.gs) {
                                console.log("[DEBUG] result.gs === player.gs.");
                                
                            }

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
                        "player": player,
                        "avg_assists": avg_assists
                    }

                    resolve(stats);
                }
            }
        })
    });
}
async function getAssistStatistics(club, position) {
    const query = "select player, a, gs from assists where club = ? and pos = ?";

    return new Promise((resolve, reject) => {
        connection.query(query, [club, position], function(error, results, fields) {
            if(error) {
                reject(error);
            } else {
                if(results.length == 0) {
                    resolve(null);
                } else {
                    /* sort results by player name because script requires it */
                    results.sort((a,b) => (a.player > b.player) ? 1 : ((b.player > a.player) ? -1 : 0));
                    
                    /* calculate max assists, avg assists, and player who scored the most assists */
                    let max_assists = 0;
                    let avg_assists = 0;
                    let player = results[0];

                    for(let result of results) {
                        /* if there is a tie for assists, favor person with higher goals scored */
                        if(result.a === max_assists) {
                            player = (result.gs > player.gs) ? result : player;
                        }

                        /* update person who has higher assists and max_axxists with their assist count */
                        if(result.a > max_assists) {
                            max_assists = result.a;
                            player = result;
                        }
                        
                        /* avg will need sum of all assists */
                        avg_assists += result.a;
                    }

                    /* divide sum of assists by number of players to get avg assists */
                    avg_assists = avg_assists / results.length;
                    /* get player field from row object */
                    player = player.player;

                    let stats = {
                        "club": club,
                        "pos": position,
                        "max_assists": max_assists,
                        "player": player,
                        "avg_assists": avg_assists
                    }

                    resolve(stats);
                }
            }
        })
    });
}

module.exports = {
    getAssistStatistics: getAssistStatistics
}
 