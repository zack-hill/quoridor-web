mod action;
mod action_type;
mod board_state;
mod vector2;
mod wall_orientation;

use action::Action;
use board_state::BoardState;
use vector2::Vector2;
use wall_orientation::WallOrientation;

#[macro_use]
extern crate lazy_static;

fn main() {
    let vec = Vector2::new(0, 5);
    let move_action = Action::create_move(Vector2::new(0, 5));
    let mut block_action = Action::create_block(Vector2::new(0, 5), WallOrientation::Vertical);
    block_action.orientation = WallOrientation::Horizontal;

    println!("{}", Vector2::new(3, 5) == Vector2::new(3, 5));
    println!("{}", Vector2::new(4, 5) == Vector2::new(3, 5));

    println!("{}", move_action);
    println!("{}", block_action);
    println!("{}", block_action.orientation);
    println!("{}", vec);
    println!("{}", vec.y);
}
