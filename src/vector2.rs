use std::fmt::{Display, Formatter, Result};
use std::ops::Add;

#[derive(Copy, Clone, PartialEq)]
pub struct Vector2<T> {
    pub x: T,
    pub y: T,
}

impl<T> Vector2<T> {
    pub fn new(x: T, y: T) -> Vector2<T> {
        Vector2 {
            x,
            y,
        }
    }
}

impl<T: Display> Display for Vector2<T> {
    fn fmt(&self, f: &mut Formatter<'_>) -> Result {
        return write!(f, "({}, {})", self.x, self.y);
    }
}

impl<T: Add<Output = T>> Add for Vector2<T> {
    type Output = Vector2<T>;
    fn add(self, rhs: Vector2<T>) -> Vector2<T> {
        return Vector2 {
            x: self.x + rhs.x,
            y: self.y + rhs.y
        };
    }
}

