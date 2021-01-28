use crate::board_state::BoardState;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;
use serde::Serialize;
use std::fmt;

#[derive(Copy, Clone, Serialize)]
pub enum Action {
    Move(Vector2<i8>),
    Block(Vector2<i8>, WallOrientation),
}

impl Action {
    pub fn apply(&self, board_state: &mut BoardState, player_index: usize) {
        match self {
            Action::Move(position) => board_state.set_player_position(player_index, *position),
            Action::Block(position, orientation) => {
                board_state.set_wall(*position, *orientation);
                board_state.set_player_wall(*position, player_index);
                board_state.set_player_wall_count(player_index, board_state.get_player_wall_count(player_index) - 1);
            }
        };
    }
}

impl fmt::Display for Action {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Action::Move(position) => write!(f, "Move: {}", position),
            Action::Block(position, orientation) => write!(f, "Block: {} {}", position, orientation),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::board_state::BoardState;

    #[test]
    fn apply_move() {
        let new_pos = Vector2::new(4, 1);
        let mut board_state = BoardState::new();
        let action = Action::Move(new_pos);

        action.apply(&mut board_state, 0);

        assert_eq!(new_pos, board_state.get_player_position(0));
    }

    #[test]
    fn apply_block() {
        let wall_position = Vector2::new(4, 1);
        let wall_orientation = WallOrientation::Vertical;
        let mut board_state = BoardState::new();
        let action = Action::Block(wall_position, wall_orientation);

        action.apply(&mut board_state, 1);

        assert_eq!(Some(wall_orientation), board_state.get_wall(wall_position));
        assert_eq!(
            1,
            board_state.player_walls[wall_position.x as usize][wall_position.y as usize]
        );
        assert_eq!(9, board_state.get_player_wall_count(1));
    }
}
