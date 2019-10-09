mod action;
mod action_type;
mod board_state;
mod vector2;
mod wall_orientation;
mod player;
mod random_player;
mod validation;

use action::Action;
use board_state::BoardState;
use player::Player;
use random_player::RandomPlayer;
use vector2::Vector2;
use wall_orientation::WallOrientation;

#[macro_use]
extern crate lazy_static;

fn main() {
    let player = RandomPlayer::new(50);
    let board_state = BoardState::new();
    let action = player.take_action(board_state, 0);
    println!("{}", action);
}
