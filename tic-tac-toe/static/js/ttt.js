var grid = [" "," "," "," "," "," "," "," "," "];
var user = "O";
var winner = "";

function setup() {
    var table = document.getElementById("ttt-table");

    if(table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].onclick = function () { make_move(this); };
            }
        }
    }
}

function make_move(table_cell) {
    if(game_ended()) {
        return;
    }

    slot = table_cell.id.replace("cell-", "");
    if(grid[slot] != " ") {
        return;
    }

    draw(table_cell, user);
    grid[slot] = user;
    
    request(slot);
}

function draw(table_cell, letter) {
    table_cell.innerHTML = letter;
}

function request() {
    $.ajax({
        type: "POST",
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify({"move": slot}),
        url: "ttt/play",
        dataType: "json",
        success: update_game_state,
        error: function(response) {
            alert("An error occurred.");
        }
    })
}

function update_game_state(response) {
    grid = response['grid'];
    winner = response['winner'];
    
    for(var i = 0; i < grid.length; i++) {
        var cell_id = "cell-" + i;
        var cell = document.getElementById(cell_id);

        draw(cell, grid[i]);
    }

    if(game_ended()) {
        print_winner();
        reset_grid();
    }
}

function game_ended() {
    return winner == 'O' || winner == 'X' || grid_full();
}

function grid_full() {
    var count = 0;

    for(var i = 0; i < grid.length; i++) {
        if(grid[i] != ' ') {
            count++;
        }
    }

    return count == 9;
}

function print_winner() {
    color = (winner == "X") ? "red" : "green"
    if(winner == " ") {
        winner = "Tie";
        color = "gold"
    }
    
    element = document.getElementById("winner");
    element.innerHTML = "<p>Winner: <strong style=\"color:" + color + "\">" + winner + "</strong></p>";
}

function reset_grid() {
    var table = document.getElementById("ttt-table");

    if(table != null) {
        for (var i = 0; i < table.rows.length; i++) {
            for (var j = 0; j < table.rows[i].cells.length; j++) {
                table.rows[i].cells[j].innerHTML = ""
            }
        }
    }
}

setup();
