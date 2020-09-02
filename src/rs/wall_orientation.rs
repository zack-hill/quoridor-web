use serde::Serialize;
use std::fmt;

#[derive(Copy, Clone, Debug, PartialEq, Serialize)]
pub enum WallOrientation {
    Vertical = 0,
    Horizontal = 1,
}

impl fmt::Display for WallOrientation {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            WallOrientation::Vertical => write!(f, "Vertical"),
            WallOrientation::Horizontal => write!(f, "Horizontal"),
        }
    }
}
