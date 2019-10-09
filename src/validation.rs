use crate::action::Action;
use crate::action_type::ActionType;
use crate::board_state::{BoardState, DIRECTIONS};
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

pub fn validate_action(board_state: BoardState, player_index: usize, action: Action) -> bool {
    if action.action_type == ActionType::Move {
        // Check if move is to a valid location
        if !get_valid_player_moves(board_state, player_index).contains(&action.position) {
            return false;
        }
    } 
    else {
        // Player has enough walls
        if board_state.get_player_wall_count(player_index) == 0 {
            return false;
        }
        // Wall is within bounds
        if !BoardState::is_wall_index_in_bounds(action.position) {
            return false;
        }
        // Wall is not on top of another wall
        if board_state.get_wall(action.position) != WallOrientation::None {
            return false;
        }
        // Wall is not directly next to another wall of the same orientation        
        let shift_amount = if action.orientation == WallOrientation::Horizontal {
            Vector2::new(1, 0)
        } else {
            Vector2::new(0, 1)
        };
        let adjacent_point_1 = action.position - shift_amount;
        let adjacent_point_2 = action.position + shift_amount;
        if BoardState::is_wall_index_in_bounds(adjacent_point_1)
            && board_state.get_wall(adjacent_point_1) == action.orientation {
            return false;
        }
        if BoardState::is_wall_index_in_bounds(adjacent_point_2)
            && board_state.get_wall(adjacent_point_2) == action.orientation {
            return false;
        }
        // Player is not boxed in
        let mut copy = board_state.clone();
        action.apply(&mut copy, player_index);
        if is_player_trapped(copy, player_index) {
            return false;
        }
        // Opponent is not boxed in
        let opponent_index = 1 - player_index;
        if is_player_trapped(copy, opponent_index) {
            return false;
        }
    }
    return true;
}

pub fn is_valid_wall(board_state: BoardState, position: Vector2<isize>, orientation: WallOrientation) -> bool {
    if board_state.get_wall(position) != WallOrientation::None {
        return false;
    }

    let shift_amount = if orientation == WallOrientation::Horizontal {Vector2::new(1, 0)} else {Vector2::new(0, 1)};

    let point_a = position + shift_amount;
    if BoardState::is_wall_index_in_bounds(point_a) && board_state.get_wall(point_a) == orientation {                
        return false;
    }

    let point_b = position - shift_amount;
    if BoardState::is_wall_index_in_bounds(point_b) && board_state.get_wall(point_b) == orientation {                
        return false;
    }

    return true;
}

pub fn is_player_trapped(mut board_state: BoardState, player_index: usize) -> bool {
    return board_state.get_player_distance(player_index) == -1;
}

pub fn is_either_player_trapped(board_state: BoardState) -> bool {
    return is_player_trapped(board_state, 0) || is_player_trapped(board_state, 1);
}

pub fn get_accessible_adjacent_cells(board_state: BoardState, cell: Vector2<isize>) -> Vec<Vector2<isize>> {
    let mut cells = Vec::new();
    for &direction in DIRECTIONS.iter() {
        let adjacent_cell = cell + direction;
        if BoardState::is_cell_index_in_bounds(adjacent_cell) && !board_state.is_path_blocked(cell, direction) {
            cells.push(adjacent_cell);
        }
    }
    return cells;
}

pub fn get_valid_moves(board_state: BoardState, from_pos: Vector2<isize>, opponent_pos: Vector2<isize>) -> Vec<Vector2<isize>> {
    let mut cells = Vec::new();
    for position in get_accessible_adjacent_cells(board_state, from_pos) {
        if position == opponent_pos {
            for jump_pos in get_valid_moves(board_state, opponent_pos, opponent_pos) {
                if jump_pos != from_pos {
                    cells.push(jump_pos);
                }
            }
        } 
        else {
            cells.push(position);
        }
    }
    return cells;
}

pub fn get_valid_player_moves(board_state: BoardState, player_index: usize) -> Vec<Vector2<isize>> {
    let player_position = board_state.get_player_position(player_index);
    let opponent_position = board_state.get_player_position(1 - player_index);
    return get_valid_moves(board_state, player_position, opponent_position);
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn player_1_is_trapped() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(4, 0), WallOrientation::Vertical);

        assert_eq!(true, is_player_trapped(board_state, 0));
        assert_eq!(true, is_either_player_trapped(board_state));
    }
    
    #[test]
    fn player_2_is_trapped() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 7), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(4, 7), WallOrientation::Vertical);

        assert_eq!(true, is_player_trapped(board_state, 1));
        assert_eq!(true, is_either_player_trapped(board_state));
    }

    #[test]
    fn player_1_is_not_trapped() {
        let board_state = BoardState::new();

        assert_eq!(false, is_player_trapped(board_state, 0));
        assert_eq!(false, is_either_player_trapped(board_state));
    }

    #[test]
    fn player_2_is_not_trapped() {
        let board_state = BoardState::new();

        assert_eq!(false, is_player_trapped(board_state, 1));
        assert_eq!(false, is_either_player_trapped(board_state));
    }

    #[test]
    fn validate_action_move_is_invalid() {
        let board_state = BoardState::new();
        let action = Action::create_move(Vector2::new(6, 0));

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_player_has_no_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_wall_count(0, 0);
        let action = Action::create_block(Vector2::new(0, 0), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_wall_is_out_of_bounds() {
        let board_state = BoardState::new();
        let action = Action::create_block(Vector2::new(-1, 0), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_wall_is_overlapping() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        let action = Action::create_block(Vector2::new(3, 7), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_wall_is_partially_overlapping() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(4, 7), WallOrientation::Horizontal);
        let action = Action::create_block(Vector2::new(3, 7), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_wall_traps_player() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Vertical);
        let action = Action::create_block(Vector2::new(4, 0), WallOrientation::Vertical);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn validate_action_wall_traps_opponent() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 7), WallOrientation::Vertical);
        let action = Action::create_block(Vector2::new(4, 7), WallOrientation::Vertical);

        assert_eq!(false, validate_action(board_state, 0, action));
    }

    #[test]
    fn get_valid_player_moves_on_edge_with_walls() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Vertical);

        let valid_moves = get_valid_player_moves(board_state, 0);

        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 0)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(5, 0)));
    }

    #[test]
    fn get_valid_player_moves_no_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_position(0, Vector2::new(3, 3));

        let valid_moves = get_valid_player_moves(board_state, 0);

        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 2)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 4)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(2, 3)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(4, 3)));
        assert_eq!(4, valid_moves.len());
    }

    #[test]
    fn get_valid_player_moves_valid_jump_no_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_position(0, Vector2::new(3, 3));
        board_state.set_player_position(1, Vector2::new(3, 4));

        let valid_moves = get_valid_player_moves(board_state, 0);

        // 3 normal moves
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 2)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(2, 3)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(4, 3)));
        // 3 jump moves
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(2, 4)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 5)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(4, 4)));
        assert_eq!(6, valid_moves.len());
    }

    #[test]
    fn get_valid_player_moves_valid_jump_with_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_position(0, Vector2::new(3, 3));
        board_state.set_player_position(1, Vector2::new(3, 4));
        board_state.set_wall(Vector2::new(2, 4), WallOrientation::Horizontal);

        let valid_moves = get_valid_player_moves(board_state, 0);

        // 3 normal moves
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 2)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(2, 3)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(4, 3)));
        // 2 jump moves
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(2, 4)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(4, 4)));
        assert_eq!(5, valid_moves.len());
    }
}