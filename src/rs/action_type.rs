use serde::Serialize;
use std::fmt;

#[derive(Copy, Clone, Debug, PartialEq, Serialize)]
pub enum ActionType {
    Move = 0,
    Block = 1,
}

impl fmt::Display for ActionType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ActionType::Move => write!(f, "Move"),
            ActionType::Block => write!(f, "Block"),
        }        
    }
}
