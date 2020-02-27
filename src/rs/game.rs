use crate::board_state::BoardState;
use crate::player::Player;
use crate::turn::Turn;

pub struct Game<'a> {
    players: [&'a dyn Player; 2],
    current_player_index: usize,
    is_over: bool,
    pub turns: Vec<Turn>,
    current_board_state: BoardState,
}

impl<'a> Game<'a> {
    pub fn new(player_1: &'a dyn Player, player_2: &'a dyn Player) -> Self {
        Game {
            players: [player_1, player_2],
            current_player_index: 0,
            is_over: false,
            turns: Vec::new(),
            current_board_state: BoardState::new(),
        }
    }

    pub fn take_turn(&mut self) -> bool {
        if self.is_over {
            return true;
        }

        let current_player = self.players[self.current_player_index];
        let action = current_player.take_action(&self.current_board_state, self.current_player_index);

        self.turns.push(Turn::new(self.current_board_state, self.current_player_index, action));

        let mut new_board_state = self.current_board_state.clone();
        action.apply(&mut new_board_state, self.current_player_index);
        self.current_board_state = new_board_state;
        
        if self.current_board_state.get_player_distance(self.current_player_index) == 0 {
            //println!("Player {} wins! ({} turns)", current_player_index, turn_count);
            self.is_over = true;
            return true;
        }

        self.switch_players();
        return false;
    }

    pub fn reset(&mut self) {
        self.current_player_index = 0;
        self.is_over = false;
        self.current_board_state = BoardState::new();
        self.turns.clear();
    }

    pub fn is_game_over(&self) -> bool {
        return self.is_over;
    }

    pub fn get_current_player_index(&self) -> usize {
        return self.current_player_index;
    }

    fn switch_players(&mut self) {
        self.current_player_index = 1 - self.current_player_index;
    }
}