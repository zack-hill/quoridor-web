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

var directions = [new Vector(1, 0), new Vector(-1, 0), new Vector(0, 1), new Vector(0, -1)];

class BoardState {
    constructor() {
        this.walls = new Matrix(8, 8, 0);
        this.playerPositions = [new Vector(4, 0), new Vector(4, 8)];
        this.playerWallCounts = [10, 10];
        this.playerWalls = new Matrix(8, 8, -1);
        this.distanceMatrices = [null, null];
    }

    copy() {
        var copy = new BoardState();
        copy.walls = this.walls.copy();
        copy.playerWalls = this.playerWalls.copy();
        copy.playerPositions = this.playerPositions.slice();
        copy.playerWallCounts = this.playerWallCounts.slice();
        return copy;
    }

    * getWallPoints(cell, direction) {
        if (direction.x == 1) {
            yield new Vector(cell.x, cell.y);
            yield new Vector(cell.x, cell.y - 1);
        } else if (direction.x == -1) {
            yield new Vector(cell.x - 1, cell.y - 1);
            yield new Vector(cell.x - 1, cell.y);
        } else if (direction.y == 1) {
            yield new Vector(cell.x, cell.y);
            yield new Vector(cell.x - 1, cell.y);
        } else if (direction.y == -1) {
            yield new Vector(cell.x - 1, cell.y - 1);
            yield new Vector(cell.x, cell.y - 1);
        }
    }

    isPathBlocked(cell, direction) {
        var orientation = direction.y == 0 ? 1 : 2;
        for (const point of this.getWallPoints(cell, direction)) {
            if (BoardState.isWallIndexInBounds(point) && this.walls.getValue(point.x, point.y) == orientation) {
                return true;
            }
        }
        return false;
    }

    static isWallIndexInBounds(pos) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < 8 && pos.y < 8;
    }

    static isCellIndexInBounds(pos) {
        return pos.x >= 0 && pos.y >= 0 && pos.x < 9 && pos.y < 9;
    }

    * getAccessibleAdjacentCells(cell) {
        for (const direction of directions) {
            var newCell = cell.add(direction);
            if (BoardState.isCellIndexInBounds(newCell) && !this.isPathBlocked(cell, direction)) {
                yield newCell;
            }
        }
    }

    * getValidMoves(fromPos, oppPos) {
        for (const position of this.getAccessibleAdjacentCells(fromPos)) {
            if (position.equals(oppPos)) {
                for (const jumpPosition of this.getValidMoves(oppPos, oppPos)) {
                    if (!jumpPosition.equals(fromPos)) {
                        yield jumpPosition;
                    }
                }
            } else {
                yield position;
            }
        }
    }

    * getValidPlayerMoves(index) {
        yield* this.getValidMoves(this.playerPositions[index], this.playerPositions[1 - index]);
    }

    calculateDistanceMatrix(row) {
        var matrix = new Matrix(9, 9, -1);
        var cellQueue = [];
        for (var x = 0; x < 9; x++) {
            var cell = new Vector(x, row);
            matrix.setValue(cell.x, cell.y, 0);
            cellQueue.push(cell);
        }
        while (cellQueue.length != 0) {
            var cell = cellQueue.shift();
            var distance = matrix.getValue(cell.x, cell.y);
            for (var direction of directions) {
                var adjacentCell = cell.add(direction);
                if (BoardState.isCellIndexInBounds(adjacentCell) && matrix.getValue(adjacentCell.x, adjacentCell.y) == -1 && !this.isPathBlocked(cell, direction)) {
                    matrix.setValue(adjacentCell.x, adjacentCell.y, distance + 1);
                    cellQueue.push(adjacentCell);
                }
            }
        }
        return matrix;
    }

    getDistanceMatrix(index) {
        if (this.distanceMatrices[index] == null) {
            this.distanceMatrices[index] = this.calculateDistanceMatrix(index == 0 ? 8 : 0);
        }
        return this.distanceMatrices[index];
    }

    getPlayerDistance(index) {
        var playerPosition = this.playerPositions[index];
        return this.getDistanceMatrix(index).getValue(playerPosition.x, playerPosition.y);
    }

    draw(canvas, showDebugMatrix, debugMatrixPlayerIndex) {
        var width = canvas.width;
        var height = canvas.height;
        var cellWidth = width / 9;
        var cellHeight = height / 9;
        const wallWidth = 5;

        var ctx = canvas.getContext("2d");

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (showDebugMatrix) {
            let debugMatrix = this.getDistanceMatrix(debugMatrixPlayerIndex);
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
                        ctx.fillStyle = "#00" + ("0" +(scaledColor).toString(16)).substr(-2) + "00";
                    }

                    drawRect(ctx, cellWidth * x, cellHeight * (8 - y), cellWidth, cellHeight)
                }
            }
        }
        

        // Draw cell borders
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        for (var x = 1; x < 9; x++) {
            drawLine(ctx, cellWidth * x, 0, cellWidth * x, height)
        }
        for (var y = 1; y < 9; y++) {
            drawLine(ctx, 0, cellHeight * y, width, cellHeight * y)
        }

        // Draw player 1
        ctx.fillStyle = "#0000FF";
        var player1Pos = new Vector(
            this.playerPositions[0].x * cellWidth + cellWidth / 4,
            (8 - this.playerPositions[0].y) * cellHeight + cellHeight / 4);
        drawRect(ctx, player1Pos.x, player1Pos.y, cellWidth / 2, cellHeight / 2)
        
        // Draw player 2
        ctx.fillStyle = "#FF0000";
        var player2Pos = new Vector(
            this.playerPositions[1].x * cellWidth + cellWidth / 4,
            (8 - this.playerPositions[1].y) * cellHeight + cellHeight / 4);
        drawRect(ctx, player2Pos.x, player2Pos.y, cellWidth / 2, cellHeight / 2)

        // Draw walls        
        ctx.lineWidth = wallWidth;
        for (var y = 0; y < 8; y++) {
            for (var x = 0; x < 8; x++) {
                var orientation = this.walls.getValue(x, y);
                if (orientation != 0) {
                    let playerIndex = this.playerWalls.getValue(x, y);
                    var center = new Vector(
                        (x + 1) * cellWidth,
                        (8 - y) * cellHeight);
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
}