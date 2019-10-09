mod action;
mod action_type;
mod board_state;
mod player;
mod random_player;
mod validation;
mod vector2;
mod wall_orientation;

use board_state::BoardState;
use player::Player;
use random_player::RandomPlayer;

#[macro_use]
extern crate lazy_static;

use std::time::{Instant};

fn main() {
    let player_1 = RandomPlayer::new(50);
    let player_2 = RandomPlayer::new(50);
    let players = [player_1, player_2];
    let mut current_player_index = 0;
    let mut board_state = BoardState::new();
    let mut total_turn_count = 0;
    let mut turn_count = 0;

    let start = Instant::now();
    let game_count = 1000;
    for x in 0..game_count {
        loop {
            let current_player = &players[current_player_index];
            let action = current_player.take_action(&board_state, current_player_index);
            if !validation::validate_action(&board_state, current_player_index, &action) {
                println!("Game {}: Player {} made an invalid move!", x, current_player_index);
                break;
            }
            action.apply(&mut board_state, current_player_index);
            turn_count += 1;
            //println!("Player {}: {}", current_player_index, action);
            if board_state.get_player_distance(current_player_index) == 0 {
                //println!("Game {}: Player {} wins! ({} turns)", x, current_player_index, turn_count);
                break;
            }
            current_player_index = 1 - current_player_index;
        }
        total_turn_count += turn_count;
        turn_count = 0;
        board_state = BoardState::new();
    }    
    let duration = start.elapsed().as_secs_f32();
    let games_per_sec = game_count as f32 / duration;
    let turns_per_sec = total_turn_count as f32 / duration;
    println!("Done ({} s | {} g/s | {} t/s)", duration, games_per_sec, turns_per_sec);
}
