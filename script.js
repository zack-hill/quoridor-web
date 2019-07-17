var game;
var canvas;

function onLoad() {
    canvas = document.getElementById("board");
    var player1 = new Player();
    var player2 = new Player();
    game = new Game(player1, player2);>
    game.draw(canvas);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function onButtonClick() {
    while (!game.takeTurn()) {
        game.draw(canvas);
        await sleep(500);
    }
    game.draw(canvas);
}