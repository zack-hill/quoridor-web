use crate::action_type::ActionType;
use crate::board_state::BoardState;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use serde::Serialize;
use std::fmt;

#[derive(Copy, Clone, Serialize)]
pub struct Action {
    pub action_type: ActionType,
    pub position: Vector2<isize>,
    pub orientation: WallOrientation,
}

impl Action {
    pub fn create_move(position: Vector2<isize>) -> Self {
        Action {
            action_type: ActionType::Move,
            position,
            orientation: WallOrientation::None,
        }
    }

    pub fn create_block(position: Vector2<isize>, orientation: WallOrientation) -> Self {
        Action {
            action_type: ActionType::Block,
            position,
            orientation,
        }
    }

    pub fn apply(&self, board_state: &mut BoardState, player_index: usize) {
        if self.action_type == ActionType::Move {
            board_state.set_player_position(player_index, self.position);
        } else {
            board_state.set_wall(self.position, self.orientation);
            board_state.set_player_wall(self.position, player_index);
            board_state.set_player_wall_count(player_index, board_state.get_player_wall_count(player_index) - 1);
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn apply_move() {
        let new_pos = Vector2::new(4, 1);
        let mut board_state = BoardState::new();
        let action = Action::create_move(new_pos);

        action.apply(&mut board_state, 0);

        assert_eq!(new_pos, board_state.get_player_position(0));
    }

    #[test]
    fn apply_block() {
        let wall_position = Vector2::new(4, 1);
        let wall_orientation = WallOrientation::Vertical;
        let mut board_state = BoardState::new();
        let action = Action::create_block(wall_position, wall_orientation);

        action.apply(&mut board_state, 1);

        assert_eq!(wall_orientation, board_state.get_wall(wall_position));
        assert_eq!(
            1,
            board_state.player_walls[wall_position.x as usize][wall_position.y as usize]
        );
        assert_eq!(9, board_state.get_player_wall_count(1));
    }
}
