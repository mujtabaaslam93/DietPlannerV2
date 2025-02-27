class Counter {
    constructor(start = 1) {
        this.counter = this.createCounter(start);
    }
    *createCounter(start) {
        let number = start;
        while (true) {
            yield number++;
        }
    }
    getNext() {
        return this.counter.next().value;
    }
}