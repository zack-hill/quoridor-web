var canvas;
var turnDelay;
var game;
var isPlaying;
var cancelToken = new Object();

function draw() {
    let showDebugMatrix = document.getElementById("dm-distance-matrix").checked;
    let debugMatrixPlayerIndex = document.getElementById("dmp-player1").checked ? 0 : 1;
    game.draw(canvas, showDebugMatrix, debugMatrixPlayerIndex);
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth;
    draw();
}

function onLoad() {
    canvas = document.getElementById("board");
    turnDelay = document.getElementById("turnDelayValue").value;

    window.addEventListener("resize", resizeCanvas, false);

    let player1 = new Player();
    let player2 = new Player();
    game = new Game(player1, player2);
    draw()
}

function insertTurnRow(turnNumber, message) {
    let turnTableBody = document.getElementById("turn-table-body");
    let row = turnTableBody.insertRow();

    var div = document.createElement("div");
    div.className = turnNumber % 2 == 1 ? "player-chip-1" : "player-chip-2";

    row.insertCell(0).innerHTML = turnNumber;
    row.insertCell(1).appendChild(div);
    row.insertCell(2).innerHTML = message;
}

async function gameLoop(cancelToken) {
    while (game.winningPlayerIndex == -1) {
        let turn = game.takeTurn();

        insertTurnRow(game.turns.length - 1, turn.action.toString());

        draw()

        if (turnDelay != 0) {
            await new Promise(resolve => setTimeout(resolve, turnDelay));
        }
        if (cancelToken.isCancelled) {
            return;
        }
    }
    console.log("Player " + (game.winningPlayerIndex + 1) + " Wins!");
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

function onPlay() {
    setIsPlaying(true);
}

function onPause() {
    setIsPlaying(false);
}

function onReset() {
    setIsPlaying(false);
    game.reset();
    draw();
    let turnTableBody = document.getElementById("turn-table-body");
    while (turnTableBody.hasChildNodes) {
        turnTableBody.removeChild(turnTableBody.lastChild);
    }
}

function onDelayChange(value) {
    turnDelay = value;
    document.getElementById("turnDelaySlider").value = value;
    document.getElementById("turnDelayValue").value = value;
}