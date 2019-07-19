class BlockAction {
    constructor(position, orientation) {
        this.position = position;
        this.orientation = orientation;
    }

    apply(boardState, playerIndex) {
        boardState.walls.setValue(this.position.x, this.position.y, this.orientation);
        boardState.playerWalls.setValue(this.position.x, this.position.y, playerIndex);
        boardState.playerWallCounts[playerIndex] = boardState.playerWallCounts[playerIndex] - 1;
    }

    toString() {
        return "Block: " + this.position.toString() + ", " + (this.orientation == 2 ? "Horizontal" : "Vertical");
    }
}