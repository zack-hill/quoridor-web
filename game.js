class Game {
    constructor(player1, player2) {
        this.players = [player1, player2];
        player1.setIndex(0);
        player2.setIndex(1);
        this.reset();
    }

    play() {
        while (this.winningPlayerIndex != -1) {
            this.takeTurn();
        }
    }

    takeTurn() {
        if (this.winningPlayerIndex != -1) {
            return null;
        }
        let currentPlayer = this.players[this.currentPlayerIndex];

        let action = currentPlayer.takeAction(this.currentBoard);

        let newBoard = this.currentBoard.copy();
        action.apply(newBoard, this.currentPlayerIndex);
        this.currentBoard = newBoard;

        let turn = new Turn(newBoard, this.currentPlayerIndex, action);
        this.turns.push(turn);

        if (this.currentBoard.getPlayerDistance(this.currentPlayerIndex) == 0) {
            this.winningPlayerIndex = this.currentPlayerIndex;
        }

        this.currentPlayerIndex = 1 - this.currentPlayerIndex;

        return turn;
    }

    reset() {
        this.currentBoard = new BoardState();
        this.currentPlayerIndex = 0;
        this.winningPlayerIndex = -1;
        this.turns = [new Turn(new BoardState(), -1, null)];
    }
}