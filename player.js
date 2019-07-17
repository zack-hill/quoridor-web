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

    takeAction(boardState) {
        while (true) {
            var rand = getRandomInt(2);
            if (rand == 1 || boardState.playerWallCounts[this.index] == 0) {
                var validMoves = Array.from(this.getValidMoves(boardState));
                return new MoveAction(validMoves[getRandomInt(validMoves.length)]);
            } else {
                var wallPosition = new Vector(getRandomInt(8), getRandomInt(8));
                var wallOrientation = getRandomInt(2) + 1;
                var action = new BlockAction(wallPosition, wallOrientation);
                if (validateAction(boardState, this.index, action)) {
                    return action;
                }
            }
        }
    }
}