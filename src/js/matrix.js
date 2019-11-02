class Matrix {
    constructor(width = 9, height = 9, defaultValue = 0) {
        this.width = width;
        this.height = height;
        this.values = new Array(width * height)
        for (var i = 0; i < width * height; i++) {
            this.values[i] = defaultValue;
        }
    }

    copy() {
        var copy = new Matrix(this.width, this.height);
        copy.values = this.values.slice();
        return copy;
    }

    getValue(x, y) {
        return this.values[y * this.height + x];
    }

    setValue(x, y, value) {
        this.values[y * this.height + x] = value;
    }

    getMaxValue() {
        return Math.max.apply(null, this.values);
    }
}