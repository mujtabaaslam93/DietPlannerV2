class DietType {
    // ========================
    // Section 1: Initialization
    // ========================
    constructor(id, experimentLevel) {
        this.id = id;
        this.experimentLevel = experimentLevel;
        this.overrideItems = [];
    }

    // =====================
    // Section 2: Setter Functions
    // =====================
    addManualOverideItem(overrideItem) {
        this.overrideItems.push(overrideItem);
    }

    // =====================
    // Section 3: Getter Functions
    // =
    getExpLevel() {
        return this.experimentLevel;
    }

    getManualOverrideItems() {
        return this.overrideItems;
    }

    // =====================
    // Section 4: Functions
    // =====================
    getManualOverrideCount() {
        return this.overrideItems.length;
    }
}