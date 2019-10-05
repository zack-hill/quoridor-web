use crate::action_type::ActionType;
use crate::wall_orientation::WallOrientation;
use nalgebra::Point2;
use std::fmt;

pub struct Action {
    pub action_type: ActionType,
    pub position: Point2<i8>,
    pub orientation: WallOrientation,
}

impl Action {
    pub fn create_move(position: Point2<i8>) -> Action {
        Action {
            action_type: ActionType::Move,
            position,
            orientation: WallOrientation::None,
        }
    }
    pub fn create_block(position: Point2<i8>, orientation: WallOrientation) -> Action {
        Action {
            action_type: ActionType::Block,
            position,
            orientation,
        }
    }
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self.action_type {
            ActionType::Move => write!(f, "{}: {}", self.action_type, self.position),
            ActionType::Block => write!(f, "{}: {} {}", self.action_type, self.position, self.orientation),
        }        
    }
}