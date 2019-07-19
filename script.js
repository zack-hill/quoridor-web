var canvas;
var turnDelay;
var game;

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth;
    game.draw(canvas);
}

function draw() {
    let showDebugMatrix = document.getElementById("dm-distance-matrix").checked;
    let debugMatrixPlayerIndex = document.getElementById("dmp-player1").checked ? 0 : 1;
    game.draw(canvas, showDebugMatrix, debugMatrixPlayerIndex);
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

function sleep() {
    if(turnDelay == 0) {
        return;
    }
    return new Promise(resolve => setTimeout(resolve, turnDelay));
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

async function onPlay() {
    while (game.winningPlayerIndex == -1) {
        let turn = game.takeTurn();

        insertTurnRow(game.turns.length - 1, turn.action.toString());

        draw()
        await sleep();
    }
    console.log("Player " + (game.winningPlayerIndex + 1) + " Wins!");
}

function onReset() {
    game.reset();
    game.draw(canvas);
    let turnTableBody = document.getElementById("turn-table-body");
    while (turnTableBody.hasChildNodes) {
        turnTableBody.removeChild(turnTableBody.lastChild,);
    }
}

function onDelayChange(value) {
    turnDelay = value;
    document.getElementById("turnDelaySlider").value = value;
    document.getElementById("turnDelayValue").value = value;
}