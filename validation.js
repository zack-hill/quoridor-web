function logError(message, action) {
    console.log("Invalid Action - " + message + " (" + action.toString() + ")");
}

function isValidWall(boardState, position, orientation) {
    if (boardState.GetWall(position) != 0)
        return false;
    var shift_amount = orientation == 1 ? new Vector(0, 1) : new Vector(1, 0);
    var pointA = position.add(shift_amount);
    if (BoardState.IsWallIndexInBounds(pointA) && boardState.GetWall(pointA) == orientation)
        return false;
    var pointB = position - shift_amount;
    if (BoardState.IsWallIndexInBounds(pointB) && boardState.GetWall(pointB) == orientation)
        return false;
    return true;
}

function isPlayerTrapped(boardState, playerIndex) {
    return boardState.getPlayerDistance(playerIndex) == -1;
}

function isEitherPlayerTrapped(boardState) {
    return isPlayerTrapped(boardState, 0) || isPlayerTrapped(boardState, 1);
}

function validateAction(boardState, playerIndex, action, printError = false) {
    if (typeof action === "MoveAction") {
        // Check if move is to a valid location
        if (!boardState.GetValidMoves(playerIndex).includes(action.position)) {
            if (printError)
                logError("Move location invalid", action);
            return false;
        }
    } else {
        // Player has enough walls
        if (boardState.playerWallCounts[playerIndex] == 0) {
            if (printError)
                logError("Player has insufficient walls", action);
            return false;
        }
        // Wall is within bounds
        if (!BoardState.isWallIndexInBounds(action.position)) {
            if (printError)
                printError("Wall out of bounds", action);
            return false;
        }
        // Wall is not on top of another wall
        if (boardState.walls.getValue(action.position.x, action.position.y) != 0) {
            if (printError)
                logError("Fully overlapping walls", action);
            return false;
        }
        // Wall is not directly next to another wall of the same orientation
        var shiftAmount = (action.orientation == 2) ?
            new Vector(1, 0) :
            new Vector(0, 1);
        var adjacentPoint1 = action.position.sub(shiftAmount);
        var adjacentPoint2 = action.position.add(shiftAmount);
        if (BoardState.isWallIndexInBounds(adjacentPoint1) &&
            boardState.walls.getValue(adjacentPoint1.x, adjacentPoint1.y) == action.orientation) {
            if (printError)
                logError("Partially overlapping walls", action);
            return false;
        }
        if (BoardState.isWallIndexInBounds(adjacentPoint2) &&
            boardState.walls.getValue(adjacentPoint2.x, adjacentPoint2.y) == action.orientation) {
            if (printError)
                logError("Partially overlapping walls", action);
            return false;
        }
        // Player is not boxed in
        var copy = boardState.copy();
        action.apply(copy, playerIndex);
        if (isPlayerTrapped(copy, playerIndex)) {
            if (printError)
                logError("Player trapped", action);
            return false;
        }
        var opponentIndex = 1 - playerIndex;
        if (isPlayerTrapped(copy, opponentIndex)) {
            if (printError)
                logError("Opponent trapped", action);
            return false;
        }
    }
    return true;
}