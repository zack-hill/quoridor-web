use crate::action::Action;
use crate::action_type::ActionType;
use crate::board_state::{BoardState, DIRECTIONS};
use crate::vector2::Vector2;
use crate::wall_orientation::WallOrientation;

pub fn validate_action(board_state: &BoardState, player_index: usize, action: &Action) -> bool {
    if action.action_type == ActionType::Move {
        // Check if move is to a valid location
        if !get_valid_move_positions(board_state, player_index).contains(&action.position) {
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
        if is_wall_overlapping(&board_state, action.position, action.orientation) {
            return false;
        }

        // Clone the board_state so we don't mutate the one passed in
        let mut copy = board_state.clone();
        action.apply(&mut copy, player_index);

        // A player is not boxed in
        if is_either_player_trapped(&copy) {
            return false;
        }
    }
    return true;
}

pub fn is_wall_overlapping(board_state: &BoardState, position: Vector2<isize>, orientation: WallOrientation) -> bool {
    // Wall is not on top of another wall
    if board_state.get_wall(position) != WallOrientation::None {
        return true;
    }

    let shift_amount = if orientation == WallOrientation::Horizontal {Vector2::new(1, 0)} else {Vector2::new(0, 1)};

    // Wall is not directly next to another wall of the same orientation    
    let point_a = position + shift_amount;
    if BoardState::is_wall_index_in_bounds(point_a) && board_state.get_wall(point_a) == orientation {                
        return true;
    }

    // Wall is not directly next to another wall of the same orientation    
    let point_b = position - shift_amount;
    if BoardState::is_wall_index_in_bounds(point_b) && board_state.get_wall(point_b) == orientation {                
        return true;
    }

    return false;
}

pub fn is_player_trapped(board_state: &BoardState, player_index: usize) -> bool {
    return board_state.get_player_distance(player_index) == -1;
}

pub fn is_either_player_trapped(board_state: &BoardState) -> bool {
    return is_player_trapped(board_state, 0) || is_player_trapped(board_state, 1);
}

pub fn get_accessible_adjacent_cells(board_state: &BoardState, cell: Vector2<isize>) -> Vec<Vector2<isize>> {
    let mut cells = Vec::new();
    for i in 0..4 {
        if board_state.cell_connections[cell.x as usize][cell.y as usize][i] {
            cells.push(cell + DIRECTIONS[i]);
        }
    }
    return cells;
}

pub fn get_accessible_cells(board_state: &BoardState, player_pos: Vector2<isize>, opponent_pos: Vector2<isize>) -> Vec<Vector2<isize>> {
    let mut cells = Vec::new();
    for position in get_accessible_adjacent_cells(board_state, player_pos) {
        if position == opponent_pos {
            for jump_pos in get_accessible_adjacent_cells(board_state, opponent_pos) {
                if jump_pos != player_pos {
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

pub fn get_valid_move_positions(board_state: &BoardState, player_index: usize) -> Vec<Vector2<isize>> {
    let player_position = board_state.get_player_position(player_index);
    let opponent_position = board_state.get_player_position(1 - player_index);
    return get_accessible_cells(board_state, player_position, opponent_position);
}

pub fn get_valid_move_actions(board_state: &BoardState, player_index: usize) -> Vec<Action> {
    return get_valid_move_positions(board_state, player_index)
        .iter()
        .map(|&pos| Action::create_move(pos))
        .collect();
}

pub fn get_valid_block_actions(board_state: &BoardState, player_index: usize) -> Vec<Action> {
    let mut actions = Vec::<Action>::new();
    if board_state.get_player_wall_count(player_index) > 0 {
        // For each column
        for x in 0..8 {
            // For each row
            for y in 0..8 {
                let pos = Vector2::new(x, y);
                // For each orientation
                for o in 0..2 {
                    // If this is a valid place to put a wall.
                    let orientation = if o == 0 {WallOrientation::Vertical} else {WallOrientation::Horizontal};
                    if !is_wall_overlapping(&board_state, pos, orientation) {
                        actions.push(Action::create_block(pos, orientation));
                    }
                }
            }
        }
    }
    return actions;
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

        assert_eq!(true, is_player_trapped(&board_state, 0));
        assert_eq!(true, is_either_player_trapped(&board_state));
    }
    
    #[test]
    fn player_2_is_trapped() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 7), WallOrientation::Vertical);
        board_state.set_wall(Vector2::new(4, 7), WallOrientation::Vertical);

        assert_eq!(true, is_player_trapped(&board_state, 1));
        assert_eq!(true, is_either_player_trapped(&board_state));
    }

    #[test]
    fn player_1_is_not_trapped() {
        let board_state = BoardState::new();

        assert_eq!(false, is_player_trapped(&board_state, 0));
        assert_eq!(false, is_either_player_trapped(&board_state));
    }

    #[test]
    fn player_2_is_not_trapped() {
        let board_state = BoardState::new();

        assert_eq!(false, is_player_trapped(&board_state, 1));
        assert_eq!(false, is_either_player_trapped(&board_state));
    }

    #[test]
    fn validate_action_move_is_invalid() {
        let board_state = BoardState::new();
        let action = Action::create_move(Vector2::new(6, 0));

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_player_has_no_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_wall_count(0, 0);
        let action = Action::create_block(Vector2::new(0, 0), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_wall_is_out_of_bounds() {
        let board_state = BoardState::new();
        let action = Action::create_block(Vector2::new(-1, 0), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_wall_is_overlapping() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        let action = Action::create_block(Vector2::new(3, 7), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_wall_is_partially_overlapping() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(4, 7), WallOrientation::Horizontal);
        let action = Action::create_block(Vector2::new(3, 7), WallOrientation::Horizontal);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_wall_traps_player() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Vertical);
        let action = Action::create_block(Vector2::new(4, 0), WallOrientation::Vertical);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn validate_action_wall_traps_opponent() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 7), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 7), WallOrientation::Vertical);
        let action = Action::create_block(Vector2::new(4, 7), WallOrientation::Vertical);

        assert_eq!(false, validate_action(&board_state, 0, &action));
    }

    #[test]
    fn get_valid_player_moves_on_edge_with_walls() {
        let mut board_state = BoardState::new();
        board_state.set_wall(Vector2::new(3, 0), WallOrientation::Horizontal);
        board_state.set_wall(Vector2::new(2, 0), WallOrientation::Vertical);

        let valid_moves = get_valid_player_moves(&board_state, 0);

        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(3, 0)));
        assert_eq!(true, valid_moves.iter().any(|x| *x == Vector2::new(5, 0)));
    }

    #[test]
    fn get_valid_player_moves_no_walls() {
        let mut board_state = BoardState::new();
        board_state.set_player_position(0, Vector2::new(3, 3));

        let valid_moves = get_valid_player_moves(&board_state, 0);

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

        let valid_moves = get_valid_player_moves(&board_state, 0);

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

        let valid_moves = get_valid_player_moves(&board_state, 0);

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