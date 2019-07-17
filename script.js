var game;
var canvas;
var turnDelaySlider;

function onLoad() {
    canvas = document.getElementById("board");
    turnDelaySlider = document.getElementById("turnDelaySlider");

    var player1 = new Player();
    var player2 = new Player();
    game = new Game(player1, player2);
    game.draw(canvas);
}

function sleep() {
    return new Promise(resolve => setTimeout(resolve, turnDelaySlider.value));
}

async function onPlay() {
    while (!game.takeTurn()) {
        game.draw(canvas);
        await sleep();
    }
    console.log("Player " + (game.winningPlayerIndex + 1) + " Wins!");
    game.draw(canvas);
}

function onReset() {
    game.reset();
    game.draw(canvas);
}

function onDelayChange(value) {
    document.getElementById("turnDelayValue").value = value;
}