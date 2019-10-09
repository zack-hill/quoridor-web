use crate::action::Action;
use crate::board_state::BoardState;
use crate::player::Player;
use crate::validation::*;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use rand::seq::SliceRandom;
use rand::{Rng};

pub struct RandomPlayer {
    move_chance: isize,
}

impl RandomPlayer {
    pub fn new(move_chance: isize) -> RandomPlayer {
        return RandomPlayer {
            move_chance
        };
    }
}

impl Player for RandomPlayer {
    fn take_action(&self, board_state: &BoardState, player_index: usize) -> Action {
        loop {
            let mut rng = rand::thread_rng();
            if rng.gen_range(0, 100) < self.move_chance || board_state.get_player_wall_count(player_index) == 0 {
                let valid_moves = get_valid_player_moves(board_state, player_index);
                let rand_move = valid_moves.choose(&mut rng).unwrap();
                let action = Action::create_move(*rand_move);
                if validate_action(board_state, player_index, &action) {
                    return action;
                }
            }
            else {
                let position = Vector2::new(rng.gen_range(0, 8), rng.gen_range(0, 8));
                let orientation = if rng.gen_range(0, 2) == 0 {WallOrientation::Horizontal} else {WallOrientation::Vertical};
                let action = Action::create_block(position, orientation);
                if validate_action(board_state, player_index, &action) {
                    return action;
                }
            }
        }
    }
}