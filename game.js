class Game {
    constructor(player1, player2) {
        this.players = [player1, player2];
        player1.setIndex(0);
        player2.setIndex(1);
        this.reset();
    }

    play() {
        while (!this.takeTurn()) {}
    }

    takeTurn() {
        if (this.winningPlayerIndex != -1) {
            return true;
        }
        var currentPlayer = this.players[this.currentPlayerIndex];

        var action = currentPlayer.takeAction(this.currentBoard);
        console.log(action.toString());

        var newBoard = this.currentBoard.copy();
        action.apply(newBoard, this.currentPlayerIndex);
        this.currentBoard = newBoard;

        if (this.currentBoard.getPlayerDistance(this.currentPlayerIndex) == 0) {
            this.winningPlayerIndex = this.currentPlayerIndex;
        }

        this.currentPlayerIndex = 1 - this.currentPlayerIndex;
    }

    reset() {
        this.currentBoard = new BoardState();
        this.currentPlayerIndex = 0;
        this.winningPlayerIndex = -1;
    }

    draw(ctx) {
        this.currentBoard.draw(ctx);
    }
}