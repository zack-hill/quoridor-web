use crate::action::Action;
use crate::board_state::BoardState;
use crate::validation::*;

use std::f32;

pub struct MinimaxPlayer {}

impl MinimaxPlayer {
    pub fn take_action(board_state: &BoardState, player_index: usize, branch_depth: usize) -> Action {
        let mut node = MinimaxBoardNode::new(board_state, player_index);
        let _turn_play_count = node.build_children(branch_depth, player_index, true, f32::MIN, f32::MAX);
        return node.best_action.unwrap();
    }
}

struct MinimaxBoardNode<'a> {
    pub board_state: &'a BoardState,
    pub player_index: usize,
    pub best_action: Option<Action>,
    pub score: f32,
}

impl<'a> MinimaxBoardNode<'a> {
    pub fn new(board_state: &'a BoardState, player_index: usize) -> Self {
        MinimaxBoardNode {
            board_state: board_state,
            player_index: player_index,
            best_action: None,
            score: 0.0,
        }
    }

    pub fn build_children(
        &mut self,
        branch_depth: usize,
        scoring_player: usize,
        maximizing: bool,
        alpha: f32,
        beta: f32,
    ) -> usize {
        let opp_index = 1 - scoring_player;
        let opp_distance = self.board_state.get_player_distance(opp_index);
        let player_distance = self.board_state.get_player_distance(scoring_player);
        if player_distance == 0 || opp_distance == 0 || branch_depth == 0 {
            // When the board has no children calculate the distances from the end for each player.
            self.score = (opp_distance - player_distance) as f32;
            return 1;
        }

        let mut valid_actions = Vec::<Action>::new();
        valid_actions.append(&mut get_valid_move_actions(&self.board_state, self.player_index));
        valid_actions.append(&mut get_valid_block_actions(&self.board_state, self.player_index));

        let mut a = alpha;
        let mut b = beta;
        let mut score = if maximizing { f32::MIN } else { f32::MAX };
        let mut best_action_index = 0;
        let mut turn_play_count = 1;
        for (i, &action) in valid_actions.iter().enumerate() {
            let mut new_board_state = self.board_state.clone();
            action.apply(&mut new_board_state, self.player_index);
            if !is_either_player_trapped(&new_board_state) {
                let mut child_node = MinimaxBoardNode::new(&new_board_state, 1 - self.player_index);
                turn_play_count += child_node.build_children(branch_depth - 1, scoring_player, !maximizing, a, b);
                if maximizing {
                    if child_node.score > score {
                        score = child_node.score;
                        best_action_index = i;
                    }
                    a = f32::max(a, score);
                    if a >= b {
                        break;
                    }
                } else {
                    if child_node.score < score {
                        score = child_node.score;
                        best_action_index = i;
                    }
                    b = f32::min(b, score);
                    if a >= b {
                        break;
                    }
                }
            }
        }

        self.best_action = Option::from(valid_actions[best_action_index]);
        self.score = score;
        return turn_play_count;
    }
}
