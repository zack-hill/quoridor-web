let boardState = null;
let validMovePositions = Array.from(Array(9), () => new Array(9).fill(false));
let validHorizontalBlockPositions = Array.from(Array(8), () => new Array(8).fill(false));
let validVerticalBlockPositions = Array.from(Array(8), () => new Array(8).fill(false));
let mouseX = null;
let mouseY = null;
let showPossibleMoves = true;

export function setBoardState(newBoardState) {
    boardState = newBoardState;
}

export function setValidActions(validActions) {
    validMovePositions = Array.from(Array(9), () => new Array(9).fill(false));
    validHorizontalBlockPositions = Array.from(Array(8), () => new Array(8).fill(false));
    validVerticalBlockPositions = Array.from(Array(8), () => new Array(8).fill(false));

    for (let action of validActions) {
        if (action.action_type == "Move") {
            validMovePositions[action.position.x][action.position.y] = true;
        }
    }
}

export function render() {
    if (boardState == null) {
        return;
    }
    drawBoard();
    drawDistanceMeter();
}

window.addEventListener("DOMContentLoaded", loaded);
window.addEventListener("resize", resizeBoardCanvas);

function loaded() {
    let canvas = document.getElementById("board");
    canvas.addEventListener("mousemove", onMouseMove)
    canvas.addEventListener("mouseout", onMouseOut)
    resizeBoardCanvas();
}

function resizeBoardCanvas() {
    let canvas = document.getElementById("board");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth;
    render();
}

function onMouseMove(e) {
    var rect = e.target.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    if (showPossibleMoves) {
        drawBoard();
    }
}

function onMouseOut() {
    mouseX = null;
    mouseY = null;
    if (showPossibleMoves) {
        drawBoard();
    }
}

function drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawRect(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.fill();
}

function isMouseInBox(x, y, w, h) {
    if (mouseX > x && 
        mouseX < x + w &&
        mouseY > y &&
        mouseY < y + h) {
        return true;
    }
    return false
}

function drawBoard() {
    let canvas = document.getElementById("board");
    let width = canvas.width;
    let height = canvas.height;
    let cellWidth = width / 9;
    let cellHeight = height / 9;
    const wallWidth = 5;

    let matrixMode = document.getElementById("select-matrix-mode").value;
    let matrixPlayer = document.getElementById("select-matrix-player").value;
    let matrixText = document.getElementById("select-matrix-text").value;
    let showDebugMatrix = matrixMode == "distance";
    let debugMatrixPlayerIndex = matrixPlayer == "player1" ? 0 : 1;
    let showPlayer1Text = matrixText == "player1" || matrixText == "both";
    let showPlayer2Text = matrixText == "player2" || matrixText == "both";
    
    let ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

    if (showPossibleMoves) {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (validMovePositions[x][y]) {
                    let offsetX = cellWidth * x;
                    let offsetY = cellHeight * (8 - y);
                    if (isMouseInBox(offsetX, offsetY, cellWidth, cellHeight)) {
                        let p1_x = Math.floor(boardState.player_positions[0].x * cellWidth + cellWidth / 4);
                        let p1_y = Math.floor((8 - boardState.player_positions[0].y) * cellHeight + cellHeight / 4);
                        drawRect(ctx, p1_x, p1_y, cellWidth / 2, cellHeight / 2)
                        ctx.fillStyle = "yellow";
                        drawRect(ctx, offsetX, offsetY, cellWidth, cellHeight)
                    }
                }
            }
        }
    }    

    if (showDebugMatrix) {
        let debugMatrix = boardState.distance_matrices[debugMatrixPlayerIndex];
        let maxValue = Math.max.apply(null, debugMatrix.reduce(function(p, c) { 
            return p.concat(c);
        }));
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                let value = debugMatrix[x][y];
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

                let offsetX = cellWidth * x;
                let offsetY = cellHeight * (8 - y);
                drawRect(ctx, offsetX, offsetY, cellWidth, cellHeight)
            }
        }

        const black = "#000000";
        const gray = "#757575";

        if (showPlayer1Text) {
            let debugMatrixP1 = boardState.distance_matrices[0];
            ctx.fillStyle = debugMatrixPlayerIndex == 0 ? black : gray;
            let fontSize = Math.floor(cellHeight / 4);
            ctx.font = fontSize + "px Arial";
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    let value = debugMatrixP1[x][y];
                    let offsetX = cellWidth * x;
                    let offsetY = cellHeight * (8 - y);
                    ctx.fillText(value, offsetX + 4, offsetY + fontSize);
                }
            }
        }

        if (showPlayer2Text) {
            let debugMatrixP2 = boardState.distance_matrices[1];
            ctx.fillStyle = debugMatrixPlayerIndex == 1 ? black : gray;
            let fontSize = Math.floor(cellHeight / 4);
            ctx.font = fontSize + "px Arial";
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < 9; x++) {
                    let value = debugMatrixP2[x][y];
                    let offsetX = cellWidth * x;
                    let offsetY = cellHeight * (8 - y);
                    ctx.fillText(value, offsetX + 4, offsetY + cellHeight - 4);
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
    let p1_x = Math.floor(boardState.player_positions[0].x * cellWidth + cellWidth / 4);
    let p1_y = Math.floor((8 - boardState.player_positions[0].y) * cellHeight + cellHeight / 4);
    drawRect(ctx, p1_x, p1_y, cellWidth / 2, cellHeight / 2)

    // Draw player 2
    ctx.fillStyle = "#FF0000";
    let p2_x = Math.floor(boardState.player_positions[1].x * cellWidth + cellWidth / 4);
    let p2_y = Math.floor((8 - boardState.player_positions[1].y) * cellHeight + cellHeight / 4);
    drawRect(ctx, p2_x, p2_y, cellWidth / 2, cellHeight / 2)

    // Draw walls        
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var centerX = Math.floor((x + 1) * cellWidth);
            var centerY = Math.floor((8 - y) * cellHeight);
            var orientation = boardState.walls[x][y];
            if (orientation != "None") {
                ctx.lineWidth = wallWidth;
                let playerIndex = boardState.player_walls[x][y]; 
                if (playerIndex == 0) {
                    ctx.strokeStyle = "#0000FF";
                } else {
                    ctx.strokeStyle = "#FF0000";
                }
                if (orientation == "Vertical") {
                    drawLine(ctx, centerX, centerY - cellHeight, centerX, centerY + cellHeight);
                } else if (orientation == "Horizontal") {
                    drawLine(ctx, centerX - cellWidth, centerY, centerX + cellWidth, centerY);
                }
            } else if (showPossibleMoves) {
                ctx.lineWidth = wallWidth * 2;
                if (validHorizontalBlockPositions[x][y] && isMouseInBox(centerX - cellWidth / 2, centerY - wallWidth, cellWidth, wallWidth * 2)) {
                    ctx.strokeStyle = "orange";
                    drawLine(ctx, centerX - cellWidth, centerY, centerX + cellWidth, centerY);                
                }
                else if (validVerticalBlockPositions[x][y] && isMouseInBox(centerX - wallWidth, centerY - cellHeight / 2, wallWidth * 2, cellHeight)) {
                    ctx.strokeStyle = "orange";
                    drawLine(ctx, centerX, centerY - cellHeight, centerX, centerY + cellHeight);
                }
            }
        }
    }
}

function drawDistanceMeter() {
    let p1Dist = boardState.distance_matrices[0][boardState.player_positions[0].x][boardState.player_positions[0].y];
    let p2Dist = boardState.distance_matrices[1][boardState.player_positions[1].x][boardState.player_positions[1].y];
    let diff = p1Dist - p2Dist;
    let distCanvas = document.getElementById("distance-meter");
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