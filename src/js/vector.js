class Vector {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(other) {
        return new Vector(this.x + other.x, this.y + other.y);
    }

    sub(other) {
        return new Vector(this.x - other.x, this.y - other.y);
    }

    toString() {
        return "(" + this.x + ", " + this.y + ")";
    }

    equals(other) {
        return this.x == other.x && this.y == other.y;
    }

    getLength() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
}