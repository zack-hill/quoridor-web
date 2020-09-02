mod action;
mod board_state;
mod minimax_player;
mod random_player;
mod shortest_path_player;
mod validation;
mod vector2;
mod wall_orientation;

use board_state::BoardState;
use minimax_player::MinimaxPlayer;
// use random_player::RandomPlayer;
use shortest_path_player::ShortestPathPlayer;

#[macro_use]
extern crate lazy_static;

use std::time::Instant;

fn main() {
    let mut total_turn_count = 0;

    let start = Instant::now();
    let game_count = 20;
    let mut player_1_wins = 0;

    println!("Playing {} Games", game_count);

    for i in 0..game_count {
        let mut board_state = BoardState::new();
        let mut player_index = 0;
        let mut turn_count = 0;
        loop {
            let action = if player_index == 0 {
                MinimaxPlayer::take_action(&board_state, player_index, 3)
            //ShortestPathPlayer::take_action(&board_state, player_index, 0.5)
            } else {
                //MinimaxPlayer::take_action(&board_state, player_index, 3)
                ShortestPathPlayer::take_action(&board_state, player_index, 0.5)
            };
            action.apply(&mut board_state, player_index);
            turn_count += 1;
            if board_state.get_player_distance(player_index) == 0 {
                if player_index == 0 {
                    player_1_wins += 1;
                }
                break;
            }
            player_index = 1 - player_index;
        }
        total_turn_count += turn_count;

        if i % 1 == 0 {
            println!(
                "Completed {} ({:.1}%) Games",
                i + 1,
                (i + 1) as f32 / game_count as f32 * 100.0
            );
        }
    }
    let duration = start.elapsed().as_secs_f32();
    let games_per_sec = game_count as f32 / duration;
    let turns_per_sec = total_turn_count as f32 / duration;
    let player_2_wins = game_count - player_1_wins;
    println!("== Complete ==");
    println!("Time Elapsed: {:.2} s)", duration);
    println!("Game rate: {:.1} g/s)", games_per_sec);
    println!("Turn rate: {:.1} t/s)", turns_per_sec);
    println!(
        "Player 1 wins: {} ({:.1}%))",
        player_1_wins,
        player_1_wins as f32 / game_count as f32 * 100.0
    );
    println!(
        "Player 2 wins: {} ({:.1}%))",
        player_2_wins,
        player_2_wins as f32 / game_count as f32 * 100.0
    );
}
