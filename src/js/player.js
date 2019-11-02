function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

class Player {
    setIndex(index) {
        this.index = index;
        this.oppIndex = 1 - index;
        this.goalRow = index == 0 ? 8 : 0;
        this.oppGoalRow = index == 0 ? 0 : 8;
    }

    getValidMoves(boardState) {
        return boardState.getValidPlayerMoves(this.index);
    }
}