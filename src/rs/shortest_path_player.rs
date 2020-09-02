use crate::action::Action;
use crate::board_state::BoardState;
use crate::validation::*;
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use rand::Rng;

pub struct ShortestPathPlayer {}

impl ShortestPathPlayer {
    pub fn take_action(board_state: &BoardState, player_index: usize, move_chance: f32) -> Action {
        let mut rng = rand::thread_rng();
        loop {
            if rng.gen::<f32>() < move_chance || board_state.get_player_wall_count(player_index) == 0 {
                // Move along shortest path
                let distance_matrix = board_state.get_distance_matrix(player_index);
                let best_move = get_best_move(board_state, player_index, &distance_matrix);
                return Action::create_move(best_move);
            } else {
                // Block along opponent's shortest path
                let opp_index = 1 - player_index;
                let distance_matrix = board_state.get_distance_matrix(opp_index);
                let mut old_position = board_state.get_player_position(opp_index);
                let new_position = get_best_move(board_state, opp_index, &distance_matrix);
                let mut direction = new_position - old_position;
                // In the case of a jump, the magnitude will be greater than 1.
                if direction.magnitude_squared() != 1 {
                    // Block from player position to new spot.
                    old_position = board_state.get_player_position(player_index);
                    direction = new_position - old_position;
                }
                let orientation = if direction.y == 0 {
                    WallOrientation::Vertical
                } else {
                    WallOrientation::Horizontal
                };
                let wall_points = get_wall_points(old_position, direction);
                for i in 0..2 {
                    let action = Action::create_block(wall_points[i], orientation);
                    if validate_action(board_state, player_index, &action) {
                        return action;
                    }
                }
            }
        }
    }
}
fn get_best_move(board_state: &BoardState, player_index: usize, distance_matrix: &[[isize; 9]; 9]) -> Vector2<isize> {
    let mut best_distance = -1;
    let mut best_move = Vector2::new(-1, -1);
    for position in get_valid_move_positions(board_state, player_index) {
        let distance = distance_matrix[position.x as usize][position.y as usize];
        if best_distance == -1 || distance < best_distance {
            best_distance = distance;
            best_move = position;
        }
    }
    return best_move;
}

fn get_wall_points(cell: Vector2<isize>, direction: Vector2<isize>) -> [Vector2<isize>; 2] {
    if direction.x == 1
    // Right
    {
        return [Vector2::new(cell.x, cell.y), Vector2::new(cell.x, cell.y - 1)];
    } else if direction.x == -1
    // Left
    {
        return [Vector2::new(cell.x - 1, cell.y - 1), Vector2::new(cell.x - 1, cell.y)];
    } else if direction.y == 1
    // Up
    {
        return [Vector2::new(cell.x, cell.y), Vector2::new(cell.x - 1, cell.y)];
    } else
    // Down
    {
        return [Vector2::new(cell.x - 1, cell.y - 1), Vector2::new(cell.x, cell.y - 1)];
    }
}
