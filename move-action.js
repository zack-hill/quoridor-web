class MoveAction {
    constructor(position) {
        this.position = position;
    }

    apply(boardState, playerIndex) {
        boardState.playerPositions[playerIndex] = this.position;
    }

    toString() {
        return "Move: " + this.position.toString();
    }
}