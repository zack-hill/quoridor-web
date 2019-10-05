mod action;
mod action_type;
mod wall_orientation;

use action::Action;
use wall_orientation::WallOrientation;
use nalgebra::Point2;

fn main() {
    let vec = Point2::new(0, 5);
    let move_action = Action::create_move(Point2::new(0, 5));
    let mut block_action = Action::create_block(Point2::new(0, 5), WallOrientation::Vertical);
    block_action.orientation = WallOrientation::Horizontal;
    println!("{}", move_action);
    println!("{}", block_action);
    println!("{}", block_action.orientation);
    println!("{}", vec);
    println!("{}", vec.y);
}
