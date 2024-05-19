class Reaction {
    // ========================
    // Section 1: Initialization
    // ========================
    constructor(reaction) {
        this.IgA = 'None';
        this.IgG = 'None';
        this.IgE = 'None';
        this.assignReaction(reaction);
    }

    // =====================
    // Section 2: Setter Functions
    // =====================
    addReaction(reaction) {
        this.assignReaction(reaction);
    }

    // =====================
    // Section 3: Getter Functions
    // =====================
    getHighestReaction() {
        var array = [];
        array.push(REACTION_ORDER.indexOf(this.IgA));
        array.push(REACTION_ORDER.indexOf(this.IgG));
        array.push(REACTION_ORDER.indexOf(this.IgE));
        return Math.max(...array);
    }

    // =====================
    // Section 4: Functions
    // =====================
    assignReaction(reaction) {
        var reactionName = REACTION_ORDER[reaction];
        if (reactionName.indexOf("IgA") >= 0)
            this.IgA = reactionName;
        else if (reactionName.indexOf("IgG") >= 0)
            this.IgG = reactionName;
        else if (reactionName.indexOf("IgE") >= 0)
            this.IgE = reactionName;

        this.highestReaction = this.getHighestReaction();
    }
}