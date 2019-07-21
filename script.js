var canvas;
var distCanvas;
var turnDelay;
var game;
var isPlaying;
var cancelToken = new Object();
var currentTurnNumber = 0;
var turnRows = [];

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth;
    redraw();
}

function onLoad() {
    canvas = document.getElementById("board");
    distCanvas = document.getElementById("distance-meter");
    turnDelay = document.getElementById("turnDelayValue").value;

    game = new Game();
    setPlayer("shortest-path", 0)
    setPlayer("shortest-path", 1)

    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();

    onReset();
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
    if (currentTurnNumber == game.turns.length - 1) {
        if (game.winningPlayerIndex != -1) {
            document.getElementById("btn-foreword").classList.add("pure-button-disabled");
        }
        document.getElementById("btn-end").classList.add("pure-button-disabled");
    } else {
        document.getElementById("btn-end").classList.remove("pure-button-disabled");
        document.getElementById("btn-foreword").classList.remove("pure-button-disabled");
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
    onJumpToTurn(game.turns.length - 1);
}

function onBack() {
    if (currentTurnNumber == 0) {
        return;
    }
    onJumpToTurn(currentTurnNumber - 1);
}

function onForward() {
    if (currentTurnNumber == game.turns.length - 1) {
        if (game.winningPlayerIndex != -1) {
            return;
        } else {
            game.takeTurn();
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

async function gameLoop(cancelToken) {
    while (!(currentTurnNumber == game.turns.length - 1 && game.winningPlayerIndex != -1)) {
        if (currentTurnNumber == game.turns.length - 1) {
            let turn = game.takeTurn();
            insertTurnRow(currentTurnNumber + 1, turn.action.toString());
        }

        setTurnNumber(currentTurnNumber + 1);

        redraw()

        if (turnDelay != 0) {
            await new Promise(resolve => setTimeout(resolve, turnDelay));
        }
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

function setPlayer(value, index) {
    if (value == "minimax") {
        game.setPlayer(new MinimaxPlayer(3), index)
    } else if (value == "shortest-path") {
        game.setPlayer(new ShortestPathPlayer(), index)
    } else {
        game.setPlayer(new RandomPlayer(), index);
    }
    document.getElementById("select-player" + (index + 1)).value = value;
}

function onReset() {
    setIsPlaying(false);

    // Reset turn information
    turnRows = [];
    let turnTableBody = document.getElementById("turn-table-body");
    while (turnTableBody.hasChildNodes()) {
        turnTableBody.removeChild(turnTableBody.lastChild);
    }
    insertTurnRow(0, "Start");
    setTurnNumber(0);

    game.reset();
    redraw();    
}

function onDelayChange(value) {
    turnDelay = value;
    document.getElementById("turnDelaySlider").value = value;
    document.getElementById("turnDelayValue").value = value;
}

function redraw() {
    let boardState = game.turns[currentTurnNumber].boardState;
    draw(boardState);
    updateDistanceMeter(boardState);
}

function draw(boardState) {
    var width = canvas.width;
    var height = canvas.height;
    var cellWidth = width / 9;
    var cellHeight = height / 9;
    const wallWidth = 5;

    let matrixMode = document.getElementById("select-matrix-mode").value;
    let matrixPlayer = document.getElementById("select-matrix-player").value;
    let matrixText = document.getElementById("select-matrix-text").value;
    let showDebugMatrix = matrixMode == "distance";
    let debugMatrixPlayerIndex = matrixPlayer == "player1" ? 0 : 1;
    let showPlayer1Text = matrixText == "player1" || matrixText == "both";
    let showPlayer2Text = matrixText == "player2" || matrixText == "both";

    var ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    if (showDebugMatrix) {
        let debugMatrix = boardState.getDistanceMatrix(debugMatrixPlayerIndex);
        let debugMatrixP1 = boardState.getDistanceMatrix(0);
        let debugMatrixP2 = boardState.getDistanceMatrix(1);
        let maxValue = debugMatrix.getMaxValue();
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                let value = debugMatrix.getValue(x, y);
                if (value == -1) {
                    ctx.fillStyle = "#808080";
                }
                else if (value == 0) {
                    ctx.fillStyle = "#00FF00";
                }
                else {
                    let scaledColor = Math.floor(230 - value / maxValue * 175);
                    ctx.fillStyle = "#00" + ("0" + (scaledColor).toString(16)).substr(-2) + "00";
                }

                let offset = new Vector(cellWidth * x, cellHeight * (8 - y));

                drawRect(ctx, offset.x, offset.y, cellWidth, cellHeight)
            }
        }

        const black = "#000000";
        const gray = "#757575";

        if (showPlayer1Text) {
            ctx.fillStyle = debugMatrixPlayerIndex == 0 ? black : gray;
            let fontSize = Math.floor(cellHeight / 4);
            ctx.font = fontSize + "px Arial";
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    let value = debugMatrixP1.getValue(x, y);
                    let offset = new Vector(cellWidth * x, cellHeight * (8 - y));
                    ctx.fillText(value, offset.x + 4, offset.y + fontSize);
                }
            }
        }

        if (showPlayer2Text) {
            ctx.fillStyle = debugMatrixPlayerIndex == 1 ? black : gray;
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    let value = debugMatrixP2.getValue(x, y);
                    let offset = new Vector(cellWidth * x, cellHeight * (8 - y));
                    ctx.fillText(value, offset.x + 4, offset.y + cellHeight - 4);
                }
            }
        }
    }

    // Draw cell borders
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#000000";
    for (var x = 1; x < 9; x++) {
        drawLine(ctx, Math.floor(cellWidth * x), 0, cellWidth * x, height)
    }
    for (var y = 1; y < 9; y++) {
        drawLine(ctx, 0, Math.floor(cellHeight * y), width, cellHeight * y)
    }

    // Draw player 1
    ctx.fillStyle = "#0000FF";
    var player1Pos = new Vector(
        Math.floor(boardState.playerPositions[0].x * cellWidth + cellWidth / 4),
        Math.floor((8 - boardState.playerPositions[0].y) * cellHeight + cellHeight / 4));
    drawRect(ctx, player1Pos.x, player1Pos.y, cellWidth / 2, cellHeight / 2)

    // Draw player 2
    ctx.fillStyle = "#FF0000";
    var player2Pos = new Vector(
        Math.floor(boardState.playerPositions[1].x * cellWidth + cellWidth / 4),
        Math.floor((8 - boardState.playerPositions[1].y) * cellHeight + cellHeight / 4));
    drawRect(ctx, player2Pos.x, player2Pos.y, cellWidth / 2, cellHeight / 2)

    // Draw walls        
    ctx.lineWidth = wallWidth;
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var orientation = boardState.walls.getValue(x, y);
            if (orientation != 0) {
                let playerIndex = boardState.playerWalls.getValue(x, y);
                var center = new Vector(
                    Math.floor(((x + 1) * cellWidth)),
                    Math.floor((8 - y) * cellHeight));
                if (playerIndex == 0) {
                    ctx.strokeStyle = "#0000FF";
                } else {
                    ctx.strokeStyle = "#FF0000";
                }
                if (orientation == 1) {
                    drawLine(ctx, center.x, center.y - cellHeight, center.x, center.y + cellHeight);
                } else if (orientation == 2) {
                    drawLine(ctx, center.x - cellWidth, center.y, center.x + cellWidth, center.y);
                }
            }
        }
    }
}

function updateDistanceMeter(boardState) {
    let p1Dist = boardState.getDistanceMatrix(0).getValue(boardState.playerPositions[0].x, boardState.playerPositions[0].y);
    let p2Dist = boardState.getDistanceMatrix(1).getValue(boardState.playerPositions[1].x, boardState.playerPositions[1].y);
    let diff = p1Dist - p2Dist;
    document.getElementById("distance-meter").value = diff;
    document.getElementById("distance-meter-label-left").textContent = diff;
    document.getElementById("distance-meter-label-right").textContent = -diff;

    distCanvas.width = distCanvas.clientWidth;
    var ctx = distCanvas.getContext("2d");
    var grd = ctx.createLinearGradient(0, 0, distCanvas.width, 0);
    grd.addColorStop(0, "red");
    grd.addColorStop(0.5, "red");
    grd.addColorStop(.5, "blue");
    grd.addColorStop(1, "blue");
    ctx.fillStyle = grd;
    drawRect(ctx, 0, 0, distCanvas.width, distCanvas.height)

    ctx.fillStyle = "#FFFFFF";
    const sliderRange = 10;
    const thumbWidth = 10;
    let x = (-Math.min(Math.max(diff, -sliderRange), sliderRange) + sliderRange) / (sliderRange * 2);
    drawRect(ctx, Math.floor(x * (distCanvas.width - thumbWidth) - 0), 0, thumbWidth, distCanvas.height)
}