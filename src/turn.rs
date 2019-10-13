use crate::action::Action;
use crate::board_state::BoardState;

pub struct Turn {
    pub board_state: BoardState,
    pub player_index: usize,
    pub action: Action,
}

impl Turn {
    pub fn new(board_state: BoardState, player_index: usize, action: Action) -> Self {
        Turn {
            board_state,
            player_index,
            action
        }
    }
}