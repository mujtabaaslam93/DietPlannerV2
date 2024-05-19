class DietItem {
    // ========================
    // Section 1: Initialization
    // ========================
    constructor(name) {
        this.name = name;
        this.reaction = null;
        this.experimentLevel = null;
        this.reactionExperimentOverride = null;
    }

    // =====================
    // Section 2: Setter Functions
    // =====================
    setReaction = function(reaction) {
        if (this.reaction == null) {
            this.reaction = new Reaction(reaction);
        }
        this.reaction.addReaction(reaction);
        //console.log(this.getHighestReaction() > 17, this.getHighestReaction());
        if (this.getHighestReaction() > 17) {
            this.setReactionExpOverride(EXP_CODE_ORDER.indexOf("Never"));
        } else if (this.getHighestReaction() > 0) {
            this.setReactionExpOverride(EXP_CODE_ORDER.indexOf("No"));
        } else {
            this.setReactionExpOverride(null);
        }
    }
    setExpLeveL = function(experimentLevel) {
        this.experimentLevel = experimentLevel;
    }
    setReactionExpOverride = function(reactionExperimentOverride) {
        this.reactionExperimentOverride = reactionExperimentOverride;
    }

    // =====================
    // Section 3: Getter Functions
    // =====================
    getExpLevel = function() {
        if (this.reactionExperimentOverride == null)
            return this.experimentLevel;
        else if (this.experimentLevel == null)
            return this.reactionExperimentOverride;
        else
            return (this.reactionExperimentOverride > this.experimentLevel ? this.experimentLevel : this.reactionExperimentOverride)
    }
    getHighestReaction = function() {
        return (this.reaction) ? this.reaction.highestReaction : 0;
    }

    // =====================
    // Section 4: Functions
    // =====================
    isFoodInDiet = function() {
        var isInDiet = true;
        if (this.getExpLevel() != null && this.getExpLevel() < 2) {
            isInDiet = false;
        } else if (this.getExpLevel() == null && this.reaction != null && this.highestReaction != 0) {
            if (this.getExpLevel() == null) {
                isInDiet = false;
            } else if (this.getExpLevel() < 1) {
                isInDiet = false;
            }
        }
        return isInDiet;
    }
}