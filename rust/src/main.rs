mod action;
mod action_type;
mod board_state;
mod game;
mod player;
mod random_player;
mod turn;
mod validation;
mod vector2;
mod wall_orientation;

use random_player::RandomPlayer;
use game::Game;

#[macro_use]
extern crate lazy_static;

use std::time::{Instant};

fn main() {
    let player_1 = RandomPlayer::new(50);
    let player_2 = RandomPlayer::new(50);
    let mut game = Game::new(&player_1, &player_2);
    
    let mut total_turn_count = 0;

    let start = Instant::now();
    let game_count = 10000;
    let mut player_1_wins = 0;

    for i in 0..game_count {
        loop {
            game.take_turn();
            if game.is_game_over() {
                if game.get_current_player_index() == 0 {
                    player_1_wins += 1;
                }
                break;
            }
        }
        total_turn_count += game.turns.len();
        game.reset();

        if i % 1000 == 0 {
            println!("{} ({}%)", i, i as f32 / game_count as f32 * 100.0);
        }
    }    
    let duration = start.elapsed().as_secs_f32();
    let games_per_sec = game_count as f32 / duration;
    let turns_per_sec = total_turn_count as f32 / duration;
    let player_2_wins = game_count - player_1_wins;
    println!("== Complete ==");
    println!("Time Elapsed: {:.2} s)", duration);
    println!("Game rate: {:.0} g/s)", games_per_sec);
    println!("Turn rate: {:.0} t/s)", turns_per_sec);
    println!("Player 1 wins: {} ({:.1}%))", player_1_wins, player_1_wins as f32 / game_count as f32 * 100.0);
    println!("Player 2 wins: {} ({:.1}%))", player_2_wins, player_2_wins as f32 / game_count as f32 * 100.0);
}
