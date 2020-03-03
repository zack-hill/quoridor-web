import init, * as Quoridor from "../../pkg/quoridor.js";
import * as Board from "./board.js";

var turnDelay;
var isPlaying;
var cancelToken = new Object();
var currentTurnNumber = 0;
var turnRows = [];
var turns = [];
var wasmInitialized = false;
var loaded = false;

window.addEventListener("DOMContentLoaded", onLoad);

async function initializeWasm() {
    await init();
    wasmInitialized = true;
    initialize();
}
initializeWasm();

function onLoad() {    
    turnDelay = document.getElementById("turn-delay-value").value;

    document.getElementById("btn-play").addEventListener("click", function() { setIsPlaying(true) });
    document.getElementById("btn-pause").addEventListener("click", function() { setIsPlaying(false) });
    document.getElementById("btn-reset").addEventListener("click", resetGame);
    document.getElementById("btn-beginning").addEventListener("click", onJumpToBeginning);
    document.getElementById("btn-back").addEventListener("click", onBack);
    document.getElementById("btn-forward").addEventListener("click", onForward);
    document.getElementById("btn-end").addEventListener("click", onJumpToEnd);
    document.getElementById("select-player1").value = "minimax-2";
    document.getElementById("select-player2").value = "shortest-path";
    document.getElementById("select-matrix-mode").addEventListener("change", redraw);
    document.getElementById("select-matrix-player").addEventListener("change", redraw);
    document.getElementById("select-matrix-text").addEventListener("change", redraw);

    document.getElementById("turn-delay-slider").addEventListener("change", onDelayChange);
    document.getElementById("turn-delay-slider").addEventListener("input", onDelayChange);
    document.getElementById("turn-delay-value").addEventListener("change", onDelayChange);

    loaded = true;
    initialize();
}

function initialize() {
    if (!wasmInitialized || !loaded) {
        return;
    }
    resetGame();
}

function setTurnNumber(turnNumber) {
    currentTurnNumber = turnNumber;
    if (currentTurnNumber == 0) {
        document.getElementById("btn-beginning").classList.add("pure-button-disabled");
        document.getElementById("btn-back").classList.add("pure-button-disabled");
    } else {
        document.getElementById("btn-beginning").classList.remove("pure-button-disabled");
        document.getElementById("btn-back").classList.remove("pure-button-disabled");
    }
    if (currentTurnNumber == turns.length - 1) {
        if (Quoridor.is_game_over()) {
            document.getElementById("btn-forward").classList.add("pure-button-disabled");
        }
        document.getElementById("btn-end").classList.add("pure-button-disabled");
    } else {
        document.getElementById("btn-end").classList.remove("pure-button-disabled");
        document.getElementById("btn-forward").classList.remove("pure-button-disabled");
    }
    for(let row of turnRows) {
        row.classList.remove("selected");
    }
    turnRows[turnNumber].classList.add("selected");
    turnRows[turnNumber].scrollIntoView({ block: 'nearest', inline: 'start' });
}

function onJumpToTurn(turnNumber) {
    setIsPlaying(false);

    setTurnNumber(turnNumber);

    redraw();
}

function onJumpToBeginning() {
    onJumpToTurn(0);
}

function onJumpToEnd() {
    onJumpToTurn(turns.length - 1);
}

function onBack() {
    if (currentTurnNumber == 0) {
        return;
    }
    onJumpToTurn(currentTurnNumber - 1);
}

function onForward() {
    if (currentTurnNumber == turns.length - 1) {
        if (Quoridor.is_game_over()) {
            return;
        } else {
            take_turn();
        }
    }
    onJumpToTurn(currentTurnNumber + 1);
}

function insertTurnRow(turnNumber, message) {
    let turnTableBody = document.getElementById("turn-table-body");
    let row = turnTableBody.insertRow();
    row.onclick = function () { onJumpToTurn(turnNumber); };

    if (turnNumber == 0) {
        row.insertCell(0);
        row.insertCell(1);
        row.insertCell(2).innerHTML = message;
    } else {
        var div = document.createElement("div");
        div.className = turnNumber % 2 == 1 ? "player-chip-1" : "player-chip-2";
        row.insertCell(0).innerHTML = turnNumber;
        row.insertCell(1).appendChild(div);
        row.insertCell(2).innerHTML = message;
    }

    turnRows.push(row);
}

function take_turn() {
    let playerIndex = currentTurnNumber % 2;
    let player = playerIndex == 0 
        ? document.getElementById("select-player1").value
        : document.getElementById("select-player2").value;

    let actionJson = null;
    if (player.startsWith("minimax")) {
        let depth = 0;
        if (player.endsWith("1")) {
            depth = 1;
        } else if (player.endsWith("2")) {
            depth = 2;
        } else if (player.endsWith("3")) {
            depth = 3;
        }
        actionJson = Quoridor.take_minimax_turn(playerIndex, depth)
    }
    else if (player.startsWith("shortest-path")) {
        actionJson = Quoridor.take_shortest_path_turn(playerIndex, 0.5)
    } else {
        actionJson = Quoridor.take_random_turn(playerIndex, 0.5)
    }
    let action = JSON.parse(actionJson);
    let boardState = JSON.parse(Quoridor.get_board());
    turns.push(boardState)

    let formattedAction = (action.action_type == "Move") 
        ? `${action.action_type} (${action.position.x}, ${action.position.y})`
        : `${action.action_type} (${action.position.x}, ${action.position.y}) ${action.orientation}`;
    insertTurnRow(currentTurnNumber + 1, formattedAction);
}

async function gameLoop(cancelToken) {
    while (!(currentTurnNumber == turns.length - 1 && Quoridor.is_game_over())) {
        if (currentTurnNumber == turns.length - 1) {
            take_turn();
        }

        setTurnNumber(currentTurnNumber + 1);

        redraw()

        // Don't actually let the delay go to zero, this will lock up the UI
        let delay = Math.max(turnDelay, 1)
        await new Promise(resolve => setTimeout(resolve, delay));
        if (cancelToken.isCancelled) {
            return;
        }
    }
    setIsPlaying(false);
}

function setIsPlaying(value) {
    isPlaying = value;
    document.getElementById("btn-play").hidden = value;
    document.getElementById("btn-pause").hidden = !value;
    if (value) {
        cancelToken = new Object();
        cancelToken.isCancelled = false;
        gameLoop(cancelToken);
    } else {
        cancelToken.isCancelled = true;
    }
}

function resetGame() {
    setIsPlaying(false);

    // Reset turn information
    turns = []
    turnRows = [];
    let turnTableBody = document.getElementById("turn-table-body");
    while (turnTableBody.hasChildNodes()) {
        turnTableBody.removeChild(turnTableBody.lastChild);
    }
    insertTurnRow(0, "Start");
    setTurnNumber(0);

    Quoridor.reset_board();
    let boardState = JSON.parse(Quoridor.get_board());
    turns.push(boardState)
    redraw();    
}

function onDelayChange(args) {
    let value = args.currentTarget.value;
    turnDelay = value;
    document.getElementById("turn-delay-slider").value = value;
    document.getElementById("turn-delay-value").value = value;
}

function redraw() {
    if (!wasmInitialized || !loaded) {
        return;
    }

    let boardState = turns[currentTurnNumber];
    Board.setBoardState(boardState);
    Board.render();
}

