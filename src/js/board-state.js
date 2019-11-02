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

let directions = [new Vector(1, 0), new Vector(-1, 0), new Vector(0, 1), new Vector(0, -1)];

class BoardState {
    constructor() {
        this.walls = new Matrix(8, 8, 0);
        this.playerPositions = [new Vector(4, 0), new Vector(4, 8)];
        this.playerWallCounts = [10, 10];
        this.playerWalls = new Matrix(8, 8, -1);
        this.distanceMatrices = [null, null];
    }

    copy() {
        let copy = new BoardState();
        copy.walls = this.walls.copy();
        copy.playerWalls = this.playerWalls.copy();
        copy.playerPositions = this.playerPositions.slice();
        copy.playerWallCounts = this.playerWallCounts.slice();
        return copy;
    }

    getWallPoints(cell, direction) {
        if (direction.x == 1) {
            return [new Vector(cell.x, cell.y), new Vector(cell.x, cell.y - 1)];
        } else if (direction.x == -1) {
            return [new Vector(cell.x - 1, cell.y - 1), new Vector(cell.x - 1, cell.y)];
        } else if (direction.y == 1) {
            return [new Vector(cell.x, cell.y), new Vector(cell.x - 1, cell.y)];
        } else if (direction.y == -1) {
            return [new Vector(cell.x - 1, cell.y - 1), new Vector(cell.x, cell.y - 1)];
        }
    }

    isPathBlocked(cell, direction) {
        const orientation = direction.y == 0 ? 1 : 2;
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
            let newCell = cell.add(direction);
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
        let matrix = new Matrix(9, 9, -1);
        let cellQueue = [];
        for (let x = 0; x < 9; x++) {
            let cell = new Vector(x, row);
            matrix.setValue(cell.x, cell.y, 0);
            cellQueue.push(cell);
        }
        while (cellQueue.length != 0) {
            let cell = cellQueue.shift();
            let distance = matrix.getValue(cell.x, cell.y);
            for (const direction of directions) {
                let adjacentCell = cell.add(direction);
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
        let playerPosition = this.playerPositions[index];
        return this.getDistanceMatrix(index).getValue(playerPosition.x, playerPosition.y);
    }
}