class Counter {
    constructor(start = 0) {
        this.number = start;
    }
    get() {
        return this.number;
    }
    getNext() {
        this.number = this.number + 1;
        return this.number;
    }
}