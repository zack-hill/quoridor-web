class MinimaxBoardNode {
    constructor(boardState, playerIndex) {
        this.boardState = boardState;
        this.score = 0;
        this.playerIndex = playerIndex;
        this.oppIndex = 1 - playerIndex;
        let pos1 = boardState.playerPositions[0];
        let pos2 = boardState.playerPositions[1];
        this.playerPos = playerIndex == 0 ? pos1 : pos2;
        this.oppPos = playerIndex == 0 ? pos2 : pos1;
        this.playerWalls = boardState.playerWallCounts[playerIndex];
        this.action = null;
    }

    buildChildren(depth, scoringPlayer, maximizing, alpha, beta) {
        let oppIndex = 1 - scoringPlayer;
        let oppDist = this.boardState.getPlayerDistance(oppIndex);
        let playerDist = this.boardState.getPlayerDistance(scoringPlayer);
        if (playerDist == 0 || oppDist == 0 || depth == 0) {
            // When the board has no children calculate the distances from the end for each player.
            this.score = oppDist - playerDist;
            return;
        }

        // Add all the valid movement positions to the valid moves.
        let validActions = Array.from(this.boardState.getValidMoves(this.playerPos, this.oppPos), x => new MoveAction(x));

        if (this.playerWalls > 0) {
            // For each column
            for (let x = 0; x < 8; x++) {
                // For each row
                for (let y = 0; y < 8; y++) {
                    let pos = new Vector(x, y);
                    // For each orientation
                    for (let o = 1; o <= 2; o++) {
                        // If this is a valid place to put a wall.
                        if (isValidWall(this.boardState, pos, o)) {
                            validActions.push(new BlockAction(pos, o));
                        }
                    }
                }
            }
        }

        let a = alpha;
        let b = beta;
        let value = maximizing ? -Infinity : Infinity;
        for (let action of validActions) {
            let newBoardState = this.boardState.copy();
            action.apply(newBoardState, this.playerIndex);
            if (!isEitherPlayerTrapped(newBoardState)) {
                let childNode = new MinimaxBoardNode(newBoardState, this.oppIndex);
                childNode.buildChildren(depth - 1, scoringPlayer, !maximizing, a, b);
                if (maximizing) {
                    if (childNode.score > value) {
                        value = childNode.score;
                        this.action = action;
                    }
                    a = Math.max(a, value);
                    if (a >= b)
                        break;
                }
                else {
                    if (childNode.score < value) {
                        value = childNode.score;
                        this.action = action;
                    }
                    b = Math.min(b, value);
                    if (a >= b)
                        break;
                }
            }
        }
        this.score = value;
    }
}

class MinimaxPlayer extends Player {

    constructor(depth) {
        super();
        this.branchDepth = depth;
    }

    takeAction(boardState) {
        let currentNode = new MinimaxBoardNode(boardState, this.index);
        currentNode.buildChildren(this.branchDepth, this.index, true, -Infinity, Infinity);
        return currentNode.action;
    }
}