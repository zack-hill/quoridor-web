use crate::action::Action;
use crate::board_state::BoardState;

pub trait Player {
    fn take_action(&self, board_state: &BoardState, player_index: usize) -> Action;
}