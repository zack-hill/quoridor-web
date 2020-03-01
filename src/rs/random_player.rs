use crate::action::Action;
use crate::board_state::BoardState;
use crate::validation::*;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use rand::seq::SliceRandom;
use rand::{Rng};

pub struct RandomPlayer { }

impl RandomPlayer {
    pub fn take_action(board_state: &BoardState, player_index: usize, move_chance: f32) -> Action {
        let mut rng = rand::thread_rng();
        loop {
            if rng.gen::<f32>() < move_chance || board_state.get_player_wall_count(player_index) == 0 {
                let valid_moves = get_valid_move_positions(board_state, player_index);
                let rand_move = valid_moves.choose(&mut rng).unwrap();
                let action = Action::create_move(*rand_move);
                return action;
            }
            else {
                let position = Vector2::new(rng.gen_range(0, 8), rng.gen_range(0, 8));
                let orientation = if rng.gen_bool(0.5) == true {WallOrientation::Horizontal} else {WallOrientation::Vertical};
                let action = Action::create_block(position, orientation);
                if validate_action(board_state, player_index, &action) {
                    return action;
                }
            }
        }
    }
}