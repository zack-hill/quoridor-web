let boardState = null;
let playerElements = Array.from(Array(2)).fill(null); 
let cellElements = Array.from(Array(9), () => new Array(9).fill(null)); 
let horWallElements = Array.from(Array(8), () => new Array(8).fill(null)); 
let verWallElements = Array.from(Array(8), () => new Array(8).fill(null)); 

export function setBoardState(newBoardState) {
    boardState = newBoardState;
}

export function render() {
    if (boardState == null) {
        return;
    }

    let matrixMode = document.getElementById("select-matrix-mode").value;
    let matrixPlayer = document.getElementById("select-matrix-player").value;
    let matrixText = document.getElementById("select-matrix-text").value;
    let showDebugMatrix = matrixMode == "distance";
    let debugMatrixPlayerIndex = matrixPlayer == "player1" ? 0 : 1;
    let showPlayer1Text = matrixText == "player1" || matrixText == "both";
    let showPlayer2Text = matrixText == "player2" || matrixText == "both";

    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 9; x++) {
            var cellElement = cellElements[x][y];

            // Update player 1 position
            if (x == boardState.player_positions[0].x && y == boardState.player_positions[0].y) {
                let parent = playerElements[0].parentElement;
                if (parent != null && parent != cellElement) {
                    playerElements[0].parentElement.removeChild(playerElements[0]);
                }
                cellElement.appendChild(playerElements[0]);
            }
            
            // Update player 2 position
            if (x == boardState.player_positions[1].x && y == boardState.player_positions[1].y) {
                let parent = playerElements[1].parentElement;
                if (parent != null && parent != cellElement) {
                    playerElements[1].parentElement.removeChild(playerElements[1]);
                }
                cellElement.appendChild(playerElements[1]);
            }

            // Update distance matrix
            if (showDebugMatrix) {
                let debugMatrix = boardState.distance_matrices[debugMatrixPlayerIndex];
                let maxValue = Math.max.apply(null, debugMatrix.reduce(function(p, c) { 
                    return p.concat(c);
                }));
                for (let y = 0; y < 9; y++) {
                    for (let x = 0; x < 9; x++) {
                        var cellElement = cellElements[x][y];
                        let value = debugMatrix[x][y];
                        if (value == -1) {
                            cellElement.style.backgroundColor = "#808080";
                        }
                        else if (value == 0) {
                            cellElement.style.backgroundColor = "#00FF00";
                        }
                        else {
                            let scaledColor = Math.floor(230 - value / maxValue * 175);
                            cellElement.style.backgroundColor = "#00" + ("0" + (scaledColor).toString(16)).substr(-2) + "00";
                        }
                    }
                }

                // const black = "#000000";
                // const gray = "#757575";
        
                // if (showPlayer1Text) {
                //     let debugMatrixP1 = boardState.distance_matrices[0];
                //     ctx.fillStyle = debugMatrixPlayerIndex == 0 ? black : gray;
                //     let fontSize = Math.floor(cellHeight / 4);
                //     ctx.font = fontSize + "px Arial";
                //     for (let y = 0; y < 9; y++) {
                //         for (let x = 0; x < 9; x++) {
                //             let value = debugMatrixP1[x][y];
                //             let offsetX = cellWidth * x;
                //             let offsetY = cellHeight * (8 - y);
                //             ctx.fillText(value, offsetX + 4, offsetY + fontSize);
                //         }
                //     }
                // }
        
                // if (showPlayer2Text) {
                //     let debugMatrixP2 = boardState.distance_matrices[1];
                //     ctx.fillStyle = debugMatrixPlayerIndex == 1 ? black : gray;
                //     let fontSize = Math.floor(cellHeight / 4);
                //     ctx.font = fontSize + "px Arial";
                //     for (let y = 0; y < 9; y++) {
                //         for (let x = 0; x < 9; x++) {
                //             let value = debugMatrixP2[x][y];
                //             let offsetX = cellWidth * x;
                //             let offsetY = cellHeight * (8 - y);
                //             ctx.fillText(value, offsetX + 4, offsetY + cellHeight - 4);
                //         }
                //     }
                // }
            }            
        }
    }

    // Update walls
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var orientation = boardState.walls[x][y];
            if (orientation != "None") {
                let playerIndex = boardState.player_walls[x][y]; 
                // if (playerIndex == 0) {
                //     ctx.strokeStyle = "#0000FF";
                // } 
                // else {
                //     ctx.strokeStyle = "#FF0000";
                // }
                if (orientation == "Vertical") {
                    let wallElement = verWallElements[x][y];
                    wallElement.classList.add(`player-${playerIndex + 1}`);
                } 
                else if (orientation == "Horizontal") {
                    let wallElement = horWallElements[x][y];
                    wallElement.classList.add(`player-${playerIndex + 1}`);
                }
            }
        }
    }

    // drawBoard();
    // drawDistanceMeter();
}

window.addEventListener("DOMContentLoaded", onLoad);
window.addEventListener("DOMContentLoaded", resizeBoardCanvas);
window.addEventListener("resize", resizeBoardCanvas);

function onLoad() {
    let board = document.getElementById("board");
    let table = document.createElement('table');
    let tableBody = document.createElement('tbody');
    for (let y = 0; y < 17; y++) {
        let row = document.createElement('tr');
        for (let x = 0; x < 17; x++) {
            let td = document.createElement('td');
            if (x % 2 == 1 && y % 2 == 0) {
                let xIndex = (x - 1) / 2;
                let yIndex = 7 - (y / 2);
                td.classList.add("board-ver-wall");
                // verWallElements[xIndex][yIndex] = td;    
            }
            else if (x % 2 == 0 && y % 2 == 1) {
                let xIndex = x - 1 / 2;
                let yIndex = 7 - ((y - 1) / 2);
                td.classList.add("board-hor-wall");
                // horWallElements[xIndex][yIndex] = td;    
            }
            else if (x % 2 == 1 && y % 2 == 1) {
                td.classList.add("board-spacer");
            }
            else {
                let xIndex = x / 2;
                let yIndex = 8 - (y / 2);
                td.classList.add("board-cell");
                td.id = `cell-${xIndex}-${yIndex}`;
                cellElements[xIndex][yIndex] = td;                
            }        
            row.appendChild(td);
        }
        tableBody.appendChild(row);
    }
    table.appendChild(tableBody);
    board.appendChild(table);

    playerElements[0] = document.createElement('div');
    playerElements[0].classList.add('player');
    playerElements[0].classList.add('player-1');
    playerElements[1] = document.createElement('div');
    playerElements[1].classList.add('player');
    playerElements[1].classList.add('player-2');
}

function resizeBoardCanvas() {
    let canvas = document.getElementById("board");
    // canvas.width = canvas.clientWidth;
    // canvas.height = canvas.clientWidth;
    // render();
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

    var ctx = canvas.getContext("2d");

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true;

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
    ctx.lineWidth = wallWidth;
    for (var y = 0; y < 8; y++) {
        for (var x = 0; x < 8; x++) {
            var orientation = boardState.walls[x][y];
            if (orientation != "None") {
                let playerIndex = boardState.player_walls[x][y]; 
                var centerX = Math.floor((x + 1) * cellWidth);
                var centerY = Math.floor((8 - y) * cellHeight);
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