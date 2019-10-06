use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;
use std::collections::VecDeque;

lazy_static! {
    static ref DIRECTIONS: [Vector2<isize>; 4] = [
        Vector2::new(1, 0),
        Vector2::new(-1, 0),
        Vector2::new(0, 1),
        Vector2::new(0, -1),
    ];
}

pub struct BoardState {
    pub walls: [[WallOrientation; 8]; 8],
    pub player_positions: [Vector2<usize>; 2],
    pub player_wall_counts: [usize; 2],
    pub distance_matrices: [Option<[[isize; 9]; 9]>; 2],
}

impl BoardState {
    pub fn new() -> BoardState {
        BoardState {
            walls: [[WallOrientation::None; 8]; 8],
            player_positions: [Vector2::new(0, 0); 2],
            player_wall_counts: [10; 2],
            distance_matrices: [None; 2],
        }
    }

    pub fn get_wall(&self, position: Vector2<isize>) -> WallOrientation {
        return self.walls[position.x as usize][position.y as usize];
    }

    pub fn set_wall(&mut self, position: Vector2<isize>, value: WallOrientation) {
        self.walls[position.x as usize][position.y as usize] = value;
        self.distance_matrices[0] = None;
        self.distance_matrices[1] = None;
    }

    pub fn get_player_position(&self, player_index: usize) -> Vector2<usize> {
        return self.player_positions[player_index];
    }

    pub fn set_player_position(&mut self, player_index: usize, position: Vector2<usize>) {
        self.player_positions[player_index] = position;
    }

    pub fn is_cell_occupied(&self, position: Vector2<usize>) -> bool {
        return self.player_positions[0] == position || self.player_positions[1] == position;
    }

    pub fn is_path_blocked(&self, cell: Vector2<isize>, direction: Vector2<isize>) -> bool {
        let orientation = if direction.y == 0 { WallOrientation::Vertical } else { WallOrientation::Horizontal };
        for &point in BoardState::get_wall_points(cell, direction).iter() {
            if BoardState::is_wall_index_in_bounds(point) && self.get_wall(point) == orientation {
                return true;
            }
        }
        return false;
    }

    pub fn get_wall_points(cell: Vector2<isize>, direction: Vector2<isize>) -> [Vector2<isize>; 2] {
        if direction.x == 1 // Right
        {
            return [Vector2::new(cell.x, cell.y), Vector2::new(cell.x, cell.y - 1)];
        }
        else if direction.x == -1 // Left
        {
            return [Vector2::new(cell.x - 1, cell.y - 1), Vector2::new(cell.x - 1, cell.y)];
        }
        else if direction.y == 1 // Up
        {
            return [Vector2::new(cell.x, cell.y), Vector2::new(cell.x - 1, cell.y)];
        }
        else // Down
        {
            return [Vector2::new(cell.x - 1, cell.y - 1), Vector2::new(cell.x, cell.y - 1)];
        }
    }

    pub fn is_wall_index_in_bounds(wall: Vector2<isize>) -> bool {
        return wall.x >= 0 && wall.y >= 0 && wall.x < 8 && wall.y < 8;
    }

    pub fn is_cell_index_in_bounds(cell: Vector2<isize>) -> bool {
        return cell.x >= 0 && cell.y >= 0 && cell.x < 9 && cell.y < 9;
    }

    pub fn get_player_distance(&mut self, player_index: usize) -> isize {
        let player_position = self.get_player_position(player_index);
        return self.get_distance_matrix(player_index)[player_position.x][player_position.y];
    }

    pub fn get_distance_matrix(&mut self, player_index: usize) -> [[isize; 9]; 9] {
        if self.distance_matrices[player_index].is_none() {
            self.distance_matrices[player_index] = Some(self.calculate_distance_matrix(if player_index == 0 {8} else {0}));
        }
        return self.distance_matrices[player_index].unwrap();
    }

    pub fn calculate_distance_matrix(&mut self, row: usize) -> [[isize; 9]; 9] {
        let mut matrix = [[-1; 9]; 9];
        let mut queue: VecDeque<Vector2<isize>> = VecDeque::new();
        for x in 0..9 {
            matrix[x][row] = 0;
            queue.push_back(Vector2::new(x as isize, row as isize));
        }
        while !queue.is_empty() {
            let cell = queue.pop_front().unwrap();
            let distance = matrix[cell.x as usize][cell.y as usize];
            for &direction in DIRECTIONS.iter() {
                let adjacent_cell = cell + direction;
                if BoardState::is_cell_index_in_bounds(adjacent_cell) 
                    && matrix[adjacent_cell.x as usize][adjacent_cell.y as usize] == -1
                    && !self.is_path_blocked(cell, direction) {
                        matrix[adjacent_cell.x as usize][adjacent_cell.y as usize] = distance + 1;
                        queue.push_back(adjacent_cell);
                }
            }
        }

        return matrix;
    }
}

