mod action;
mod board_state;
mod minimax_player;
mod random_player;
mod shortest_path_player;
mod validation;
mod vector2;
mod wall_orientation;

use crate::action::Action;
use crate::board_state::BoardState;
use crate::minimax_player::MinimaxPlayer;
use crate::random_player::RandomPlayer;
use crate::shortest_path_player::ShortestPathPlayer;
use crate::validation::*;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use std::sync::Mutex;
use wasm_bindgen::prelude::*;

#[macro_use]
extern crate lazy_static;

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

lazy_static! {
    static ref BOARD_STATE: Mutex<BoardState> = Mutex::new(BoardState::new());
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn get_board() -> String {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    return String::from(serde_json::to_string(&**board_state).unwrap());
}

#[wasm_bindgen]
pub fn is_game_over() -> bool {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    return board_state.get_player_distance(0) == 0 || board_state.get_player_distance(1) == 0;
}

#[wasm_bindgen]
pub fn reset_board() {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    **board_state = BoardState::new();
}

#[wasm_bindgen]
pub fn take_random_turn(player_index: usize, move_chance: f32) -> String {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    let action = RandomPlayer::take_action(&board_state, player_index, move_chance);
    action.apply(board_state, player_index);
    return String::from(serde_json::to_string(&action).unwrap());
}

#[wasm_bindgen]
pub fn take_shortest_path_turn(player_index: usize, move_chance: f32) -> String {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    let action = ShortestPathPlayer::take_action(&board_state, player_index, move_chance);
    action.apply(board_state, player_index);
    return String::from(serde_json::to_string(&action).unwrap());
}

#[wasm_bindgen]
pub fn take_minimax_turn(player_index: usize, branch_depth: usize) -> String {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    let action = MinimaxPlayer::take_action(&board_state, player_index, branch_depth);
    action.apply(board_state, player_index);
    return String::from(serde_json::to_string(&action).unwrap());
}

#[wasm_bindgen]
pub fn get_valid_actions(player_index: usize) -> String {
    let board_state = &mut BOARD_STATE.lock().unwrap();
    let mut valid_actions = Vec::<Action>::new();
    valid_actions.append(&mut get_valid_move_actions(&board_state, player_index));
    valid_actions.append(&mut get_valid_block_actions(&board_state, player_index));
    return String::from(serde_json::to_string(&valid_actions).unwrap());
}

#[wasm_bindgen]
pub fn apply_move_action(x: isize, y: isize, player_index: usize) -> String {
    let action = Action::Move(Vector2::new(x, y));
    let board_state = &mut BOARD_STATE.lock().unwrap();
    action.apply(board_state, player_index);
    return String::from(serde_json::to_string(&action).unwrap());
}

#[wasm_bindgen]
pub fn apply_block_action(x: isize, y: isize, orientation: usize, player_index: usize) -> String {
    let wall_orientation = if orientation == 0 {
        WallOrientation::Horizontal
    } else {
        WallOrientation::Vertical
    };
    let action = Action::Block(Vector2::new(x, y), wall_orientation);
    let board_state = &mut BOARD_STATE.lock().unwrap();
    action.apply(board_state, player_index);
    return String::from(serde_json::to_string(&action).unwrap());
}
