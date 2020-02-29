use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

use std::collections::VecDeque;
use serde::Serialize;

const RIGHT: usize = 0;
const UP: usize = 1;
const LEFT: usize = 2;
const DOWN: usize = 3;
lazy_static! {
    pub static ref DIRECTIONS: [Vector2<isize>; 4] = [
        Vector2::new(1, 0),
        Vector2::new(0, 1),
        Vector2::new(-1, 0),
        Vector2::new(0, -1),
    ];
}

#[derive(Copy, Clone, Serialize)]
pub struct BoardState {
    pub walls: [[WallOrientation; 8]; 8],
    pub cell_connections: [[[bool; 4]; 9]; 9],
    pub player_positions: [Vector2<isize>; 2],
    pub player_wall_counts: [usize; 2],
    pub player_walls: [[isize; 8]; 8],
    pub distance_matrices: [[[isize; 9]; 9]; 2],
}

impl BoardState {
    pub fn new() -> Self {
        let mut board_state = BoardState {
            walls: [[WallOrientation::None; 8]; 8],
            cell_connections: [[[true; 4]; 9]; 9],
            player_positions: [Vector2::new(4, 0), Vector2::new(4, 8)],
            player_wall_counts: [10; 2],
            player_walls: [[-1; 8]; 8],
            distance_matrices: [[[-1; 9]; 9]; 2],
        };
        for x in 0..9 {
            // Block the up direction for the top row.
            board_state.cell_connections[x][8][UP] = false;
            // Block the down direction for the bottom row.
            board_state.cell_connections[x][0][DOWN] = false;
        }
        for y in 0..9 {
            // Block the left direction for the left column.
            board_state.cell_connections[0][y][LEFT] = false;
            // Block the right direction for the right column.
            board_state.cell_connections[8][y][RIGHT] = false;
        }
        board_state.distance_matrices[0] = board_state.calculate_distance_matrix(8);
        board_state.distance_matrices[1] = board_state.calculate_distance_matrix(0);        
        return board_state;
    }

    pub fn get_wall(&self, position: Vector2<isize>) -> WallOrientation {
        return self.walls[position.x as usize][position.y as usize];
    }

    pub fn set_wall(&mut self, position: Vector2<isize>, value: WallOrientation) {
        let x = position.x as usize;
        let y = position.y as usize;
        self.walls[x][y] = value;
        if value == WallOrientation::Horizontal {
            self.cell_connections[x][y][UP] = false;
            self.cell_connections[x][y + 1][DOWN] = false;
            self.cell_connections[x + 1][y][UP] = false;
            self.cell_connections[x + 1][y + 1][DOWN] = false;
        } 
        else if value == WallOrientation::Vertical {
            self.cell_connections[x][y][RIGHT] = false;
            self.cell_connections[x + 1][y][LEFT] = false;
            self.cell_connections[x][y + 1][RIGHT] = false;
            self.cell_connections[x + 1][y + 1][LEFT] = false;
        }
        self.distance_matrices[0] = self.calculate_distance_matrix(8);
        self.distance_matrices[1] = self.calculate_distance_matrix(0);
    }

    pub fn set_player_wall(&mut self, position: Vector2<isize>, player_index: usize) {
        self.player_walls[position.x as usize][position.y as usize] = player_index as isize;
    }

    pub fn get_player_position(&self, player_index: usize) -> Vector2<isize> {
        return self.player_positions[player_index];
    }

    pub fn set_player_position(&mut self, player_index: usize, position: Vector2<isize>) {
        self.player_positions[player_index] = position;
    }

    pub fn get_player_wall_count(&self, player_index: usize) -> usize {
        return self.player_wall_counts[player_index];
    }

    pub fn set_player_wall_count(&mut self, player_index: usize, value: usize) {
        self.player_wall_counts[player_index] = value;
    }

    pub fn is_wall_index_in_bounds(wall: Vector2<isize>) -> bool {
        return wall.x >= 0 && wall.y >= 0 && wall.x < 8 && wall.y < 8;
    }

    pub fn is_cell_index_in_bounds(cell: Vector2<isize>) -> bool {
        return cell.x >= 0 && cell.y >= 0 && cell.x < 9 && cell.y < 9;
    }

    pub fn get_player_distance(&self, player_index: usize) -> isize {
        let player_position = self.get_player_position(player_index);
        return self.get_distance_matrix(player_index)[player_position.x as usize][player_position.y as usize];
    }

    pub fn get_distance_matrix(&self, player_index: usize) -> [[isize; 9]; 9] {
        return self.distance_matrices[player_index];
    }

    fn calculate_distance_matrix(&self, row: usize) -> [[isize; 9]; 9] {
        let mut matrix = [[-1; 9]; 9];
        let mut queue: VecDeque<Vector2<isize>> = VecDeque::new();
        for x in 0..9 {
            matrix[x][row] = 0;
            queue.push_back(Vector2::new(x as isize, row as isize));
        }
        while !queue.is_empty() {
            let cell = queue.pop_front().unwrap();
            let distance = matrix[cell.x as usize][cell.y as usize];
            for i in 0..4 {
                if self.cell_connections[cell.x as usize][cell.y as usize][i] {
                    let adjacent_cell = cell + DIRECTIONS[i];
                    if matrix[adjacent_cell.x as usize][adjacent_cell.y as usize] == -1 {
                        matrix[adjacent_cell.x as usize][adjacent_cell.y as usize] = distance + 1;
                        queue.push_back(adjacent_cell);
                    }
                }
            }
        }

        return matrix;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn set_wall() {
        let expected = WallOrientation::Vertical;
        let pos = Vector2::new(3, 5);
        let mut board_state = BoardState::new();
        board_state.set_wall(pos, expected);

        assert_eq!(expected, board_state.get_wall(pos));
    }
    
    #[test]
    fn set_player_position() {
        let expected = Vector2::new(5, 1);
        let mut board_state = BoardState::new();
        board_state.set_player_position(1, expected);

        assert_eq!(expected, board_state.get_player_position(1));
    }

    #[test]
    fn is_path_blocked_no_walls() {
        let board_state = BoardState::new();

        assert_eq!(false, board_state.is_path_blocked(Vector2::new(5, 5), Vector2::new(0, 1)));
        assert_eq!(false, board_state.is_path_blocked(Vector2::new(5, 5), Vector2::new(1, 0)));
    }
    
    #[test]
    fn is_path_blocked_horizontal() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(5, 5), WallOrientation::Horizontal);

        assert_eq!(false, board_state.is_path_blocked(Vector2::new(4, 5), Vector2::new(0, 1)));
        assert_eq!(true, board_state.is_path_blocked(Vector2::new(5, 5), Vector2::new(0, 1)));
        assert_eq!(true, board_state.is_path_blocked(Vector2::new(6, 5), Vector2::new(0, 1)));
        assert_eq!(false, board_state.is_path_blocked(Vector2::new(7, 5), Vector2::new(0, 1)));
    }
    
    #[test]
    fn is_path_blocked_vertical() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(5, 5), WallOrientation::Vertical);

        assert_eq!(false, board_state.is_path_blocked(Vector2::new(5, 4), Vector2::new(1, 0)));
        assert_eq!(true, board_state.is_path_blocked(Vector2::new(5, 5), Vector2::new(1, 0)));
        assert_eq!(true, board_state.is_path_blocked(Vector2::new(5, 6), Vector2::new(1, 0)));
        assert_eq!(false, board_state.is_path_blocked(Vector2::new(5, 7), Vector2::new(1, 0)));
    }

    #[test]
    fn is_wall_index_in_bounds() {
        assert_eq!(true, BoardState::is_wall_index_in_bounds(Vector2::new(5, 1)));
        assert_eq!(true, BoardState::is_wall_index_in_bounds(Vector2::new(1, 5)));
        assert_eq!(false, BoardState::is_wall_index_in_bounds(Vector2::new(-1, 4)));
        assert_eq!(false, BoardState::is_wall_index_in_bounds(Vector2::new(8, 4)));
        assert_eq!(false, BoardState::is_wall_index_in_bounds(Vector2::new(4, -1)));
        assert_eq!(false, BoardState::is_wall_index_in_bounds(Vector2::new(4, 8)));
    }

    #[test]
    fn is_cell_index_in_bounds() {
        assert_eq!(true, BoardState::is_cell_index_in_bounds(Vector2::new(1, 5)));
        assert_eq!(true, BoardState::is_cell_index_in_bounds(Vector2::new(1, 5)));
        assert_eq!(false, BoardState::is_cell_index_in_bounds(Vector2::new(-1, 4)));
        assert_eq!(false, BoardState::is_cell_index_in_bounds(Vector2::new(9, 4)));
        assert_eq!(false, BoardState::is_cell_index_in_bounds(Vector2::new(4, -1)));
        assert_eq!(false, BoardState::is_cell_index_in_bounds(Vector2::new(4, 9)));
    }

    #[test]
    fn get_player_distance() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(5, 5), WallOrientation::Horizontal);
        board_state.set_player_position(0, Vector2::new(5, 5));
        
        assert_eq!(4, board_state.get_player_distance(0));
    }

    #[test]
    fn get_distance_matrix_player_1() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(0, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(4, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(5, 1), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(4, 2), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(1, 1), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(0, 2), WallOrientation::Horizontal);

        let matrix = board_state.get_distance_matrix(0);

        assert_eq!(0, matrix[4][8]);
        assert_eq!(10, matrix[4][0]);
        assert_eq!(8, matrix[4][1]);
        assert_eq!(-1, matrix[1][1]);
    }

    #[test]
    fn get_distance_matrix_player_2() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(0, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(4, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(5, 1), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(4, 2), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(1, 1), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(0, 2), WallOrientation::Horizontal);

        let matrix = board_state.get_distance_matrix(1);

        assert_eq!(0, matrix[4][0]);
        assert_eq!(10, matrix[4][8]);
        assert_eq!(9, matrix[4][1]);
        assert_eq!(-1, matrix[1][1]);
    }
}