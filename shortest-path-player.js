class ShortestPathPlayer extends Player {

    takeAction(boardState) {
        while (true) {
            let rand = getRandomInt(2);
            if (rand == 1 || boardState.playerWallCounts[this.index] == 0) {
                // Move along shortest path
                let distanceMatrix = boardState.getDistanceMatrix(this.index);
                let bestMove = this.getBestMove(boardState, this.index, distanceMatrix);
                return new MoveAction(bestMove);
            } else {
                // Block along opponent's shortest path            
                let distanceMatrix = boardState.getDistanceMatrix(this.oppIndex);
                let oldPosition = boardState.playerPositions[this.oppIndex];
                let newPosition = this.getBestMove(boardState, this.oppIndex, distanceMatrix);
                let direction = newPosition.sub(oldPosition);
                // In the case of a jump, the length will either be √2 or 2.
                if (direction.getLength() != 1) {
                    // Block from player position to new spot.
                    oldPosition = boardState.playerPositions[this.index];
                    direction = newPosition.sub(oldPosition);
                }
                let orientation = direction.y == 0 ? 1 : 2;                
                for (let point of boardState.getWallPoints(oldPosition, direction)) {
                    let action = new BlockAction(point, orientation);
                    if (validateAction(boardState, this.index, action)) {
                        return action;
                    }
                }
            }
        }
    }
    
    getBestMove(boardState, playerIndex, distanceMatrix) {
        let bestDistance = -1;
        let bestMove = new Vector(-1, -1);
        for (let position of boardState.getValidPlayerMoves(playerIndex)) {
            let distance = distanceMatrix.getValue(position.x, position.y);
            if (bestDistance === -1 || distance < bestDistance) {
                bestDistance = distance;
                bestMove = position;
            }
        }
        return bestMove;
    }
}