use std::fmt;
use serde::Serialize;

#[derive(Copy, Clone, Debug, PartialEq, Serialize)]
pub enum WallOrientation {
    None = 0,
    Vertical = 1,
    Horizontal = 2,
}

impl fmt::Display for WallOrientation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            WallOrientation::None => write!(f, "None"),
            WallOrientation::Vertical => write!(f, "Vertical"),
            WallOrientation::Horizontal => write!(f, "Horizontal"),
        }        
    }
}