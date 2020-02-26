use std::fmt::{Display, Formatter, Result};
use std::ops::{Add, Sub};

#[derive(Copy, Clone, Debug, PartialEq)]
pub struct Vector2<T> {
    pub x: T,
    pub y: T,
}

impl<T> Vector2<T> {
    pub fn new(x: T, y: T) -> Self {
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
    fn add(self, rhs: Vector2<T>) -> Self {
        return Vector2 {
            x: self.x + rhs.x,
            y: self.y + rhs.y
        };
    }
}

impl<T: Sub<Output = T>> Sub for Vector2<T> {
    type Output = Vector2<T>;
    fn sub(self, rhs: Vector2<T>) -> Self {
        return Vector2 {
            x: self.x - rhs.x,
            y: self.y - rhs.y
        };
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add() {
        let a = Vector2::new(2, 7);
        let b = Vector2::new(4, 1);

        let result = a + b;

        assert_eq!(6, result.x);
        assert_eq!(8, result.y);
    }

    #[test]
    fn sub() {
        let a = Vector2::new(2, 7);
        let b = Vector2::new(4, 1);

        let result = a - b;

        assert_eq!(-2, result.x);
        assert_eq!(6, result.y);
    }

    #[test]
    fn equals() {
        assert_eq!(Vector2::new(5, 1), Vector2::new(5, 1));
    }

    #[test]
    fn not_equals() {
        assert_ne!(Vector2::new(1, 1), Vector2::new(1, 2));
        assert_ne!(Vector2::new(1, 1), Vector2::new(2, 1));
        assert_ne!(Vector2::new(1, 1), Vector2::new(2, 2));
    }
}