class DietPlannerV2 {
    // ========================
    // Section 1: Initialization
    // ========================
    constructor(isAutoImmune = false) {
        this.eventManager = new EventManager(this);

        this.events = {};
        this.dietItems = {};
        this.dietTypesSelected = {};
        this.isAutoImmune = isAutoImmune;
        this.foodPanels = {};
        this.selectedDietFoodLookup = {};
    }

    // ======================
    // Section 2: Data Loading
    // ======================
    setFoodList = function(foodData) {
        this.autoImmuneFoods = [];
        this.foodList = {};
        this.ingredientMap = {}; //to get food from ingredients
        foodData.forEach(foodItem => {
            foodItem['pid'] = (foodItem.AkaItem) ? foodItem.FID : null;
            this.foodList[foodItem['id']] = foodItem;
            //Create Ingredient Map
            foodItem.Ingredients.forEach(ingredient => {
                if (this.ingredientMap[ingredient.IID]) {
                    this.ingredientMap[ingredient.IID].push(foodItem['id']);
                } else {
                    this.ingredientMap[ingredient.IID] = [foodItem['id']];
                }
            });
            //Create Immune List
            if (foodItem.ImmuneReaction === 1)
                this.autoImmuneFoods.push(foodItem['id']);
        });
        console.log("Total Foods " + Object.keys(this.foodList).length);
    }
    setDietTypeList = function(dietTypes) {
        this.dietTypesList = {};
        dietTypes.forEach(dietType => {
            this.dietTypesList[dietType['id']] = {
                id: dietType['id'],
                name: dietType['Name'],
                fooditems: dietType['FoodItems'],
                type: dietType['Type'],
                childs: dietType['childDiets'],
                parents: dietType['parentDiets']
            };

        });
        console.log("Total Diet Types " + Object.keys(this.dietTypesList).length);
    }

    // =====================
    // Section 4: Getter Functions
    // =====================
    getEvents = function() {
        return this.events;
    }
    getAllDietItems = function() {
        return this.dietItems;
    }
    getFoodList = function() {
        return this.foodList;
    }
    foodExist = function(foodId) {
        return this.foodList.hasOwnProperty(foodId);
    }
    getFoodItem = function(foodId) {
        return this.foodList[foodId];
    }
    getFoodName = function(foodId) {
        return this.foodList[foodId].Name;
    }
    getDietTypesList = function() {
        return this.dietTypesList;
    }
    getDietType(dietTypeId) {
        return this.dietTypesList[dietTypeId];
    }
    getSelectedDietType(dietTypeId) {
        return this.dietTypesSelected[dietTypeId];
    }
    getDietTypeManualOverrideCount(dietTypeId) {
        return this.dietTypesSelected[dietTypeId].getManualOverrideCount();
    }
    isAnotherParentDietSelected(parentId, childId) {
        var hasAnotherParentDiet = false;
        Object.entries(this.dietTypesSelected).forEach(([dietTypeId, dietTypeItem]) => {
            if (parentId != dietTypeItem.id) {
                var childDietIds = Object.keys(this.getChildDiets(dietTypeId));
                if (childId in childDietIds)
                    hasAnotherParentDiet = false;
            }
        });
        return hasAnotherParentDiet;
    }
    addSelectedDietFoodLookup = function(foodId, dietId) {
        if (this.selectedDietFoodLookup[foodId] == null)
            this.selectedDietFoodLookup[foodId] = [];
        if (!this.selectedDietFoodLookup[foodId].includes(dietId))
            this.selectedDietFoodLookup[foodId].push(dietId);
    }
    isItemInAnotherDiet = function(foodId, dietId) {
        var dietApplied = this.selectedDietFoodLookup[foodId];
        return dietApplied.length > 1;
    }
    getDietTypesAppliedByFood = function(foodId) {
        return this.selectedDietFoodLookup[foodId];
    }
    getFoodsByDietType = function(dietTypeId) {
        return this.dietTypesList[dietTypeId].fooditems;
    }
    getChildDiets = function(dietTypeId) {
        return this.dietTypesList[dietTypeId].childs;
    }
    getDietItem = function(foodId) {
        return this.dietItems[foodId];
    }
    getIngredients = function(foodId) {
        return this.foodList[foodId]['Ingredients'].map(item => item.IID);
    }
    getFoodMadeFrom = function(foodId) {
        if (this.ingredientMap[foodId])
            return this.ingredientMap[foodId];
        else
            return [];
    }
    getAkaFoods = function(foodId) {
        return this.foodList[foodId]['FoodAka'].map(item => ('Aka-' + item.id !== foodId) ? 'Aka-' + item.id : null).filter(id => id !== null);
    }
    hasAutoImmuneIssues = function() {
        return this.isAutoImmune;
    }
    getDiet() {
        var dietPlannerV2Diet = {
            events: this.getEvents(),
            dietItems: this.getAllDietItems(),
            isAutoImmune: this.hasAutoImmuneIssues()
        }
        return dietPlannerV2Diet;
    }

    // =====================
    // Section 4: Setter Functions
    // =====================
    setEvents = function(events) {
        this.events = events;
        this.eventManager.run();
    }
    removeEvent = function(eventId) {
        delete this.events[eventId];
        this.eventManager.run();
        console.log(this.events);
        console.log(this.dietItems);
    }
    setAutoImmune = function(isAutoImmune) {
        this.isAutoImmune = isAutoImmune;
        return this.eventManager.handleEvent('setAutoImmune', isAutoImmune);
    }
    addfoodPanel = function(foodPanelId, foodPanel) {
        this.foodPanels[foodPanelId] = foodPanel;
    }
    setReactionExperimentLevels = function(reactionExperimentLevels) {
        this.reactionExperimentLevels = reactionExperimentLevels;
    }
    resetDiet = function() {
        this.dietItems = {};
        this.dietTypesSelected = {};
        this.isAutoImmune = false;
        this.selectedDietFoodLookup = {};
    }
    addReaction = function(foodId, reaction) {
        return this.eventManager.handleEvent('setReaction', {
            foodId: foodId,
            reaction: reaction
        });
    }
    setDietType = function(dietTypeId, experimentLevel) {
        return this.eventManager.handleEvent('setDietType', {
            dietTypeId: dietTypeId,
            experimentLevel: experimentLevel
        });
    }
    removeDietType = function(dietTypeId) {
        return this.eventManager.handleEvent('removeDietType', dietTypeId);
    }
    addDietOverideItem = function(dietTypeId, foodId, experimentLevel) {
        return this.eventManager.handleEvent('addDietOverideItem', {
            dietTypeId: dietTypeId,
            overrideItem: {
                foodId: foodId,
                foodName: this.getFoodName(foodId),
                experimentLevel: experimentLevel
            }
        });
    }
    addOverrideItem = function(foodId, experimentLevel) {
        return this.eventManager.handleEvent('addOverrideItem', {
            foodId: foodId,
            experimentLevel: experimentLevel
        });

    }
    getAllOverrideItems() {
        var overrideItems = {};
        var events = this.events;
        for (const id in events) {
            var event = this.events[id];
            var eventType = id.split('-')[0];
            if (eventType == 'override') {
                var item = [];
                item.foodId = event.foodId;
                item.experimentLevel = event.experimentLevel;
                item.name = this.getFoodName(event.foodId);
                item.reaction = this.dietItems[event.foodId].getHighestReaction();
                overrideItems[event.foodId] = item;
            }
        };
        return overrideItems;
    }
    removeOverrideItems = function(foodIdArray) {
        return this.eventManager.handleEvent('removeOverrideItems', foodIdArray);

    }
    setExperimentLevelByReactions = function(data) {
        return this.eventManager.handleEvent('setExperimentLevelByReactions', data);
    }

    // ===================
    // Section 3: Functions
    // ===================
    addDietItemReaction = function(foodId, reaction) {

        if (!this.hasHigherReactionIngredient(foodId, reaction)) {
            //Set reaction of food
            if (this.dietItems[foodId] == null) {
                this.dietItems[foodId] = new DietItem(this.getFoodName(foodId));
            }
            //Avoid recurrsion
            if (this.dietItems[foodId].getHighestReaction() == reaction) {
                return;
            }

            //Set reaction of food Item
            this.dietItems[foodId].setReaction(reaction);
            //Set Reaction of parent if any
            var parentId = this.foodList[foodId]['pid'];
            if (parentId) {
                this.addDietItemReaction(parentId, reaction);
            }
            //Set reaction for AKA
            this.getAkaFoods(foodId).forEach(akaid => {
                this.addDietItemReaction(akaid, reaction);
            });
            //Set reaction for food in which foodId is ingredient 
            this.getFoodMadeFrom(foodId).forEach(id => {
                this.addDietItemReaction(id, reaction);
            });

        }
    }
    hasHigherReactionIngredient = function(foodId, reaction) {
        var hasHigherReactionIngredient = false;
        var ingredients = this.getIngredients(foodId);
        ingredients.forEach(iid => {
            if (this.dietItems[iid] && this.dietItems[iid].getHighestReaction() > reaction) {
                hasHigherReactionIngredient = true;
            }
        });
        return hasHigherReactionIngredient;
    }
    addDietType = function(dietTypeId, experimentLevel) {
        //console.log(this.dietTypesList[dietTypeId].name, this.dietTypesList[dietTypeId].fooditems);
        var foodItems = this.dietTypesList[dietTypeId].fooditems;
        foodItems.forEach(foodItem => {
            this.addSelectedDietFoodLookup(foodItem.FID, dietTypeId);
            this.addDietItemExpLevel(foodItem.FID, experimentLevel, !this.isItemInAnotherDiet(foodItem.FID, dietTypeId));
        });
        var childDiets = this.dietTypesList[dietTypeId].childs;
        childDiets.forEach(childDiet => {
            this.addDietType(childDiet.DTIDC, experimentLevel, false);
        });

    }
    addDietItemExpLevel = function(foodId, experimentLevel, isManual = false) {
        if (!this.foodExist(foodId))
            return;
        if (this.dietItems[foodId] == null) {
            this.dietItems[foodId] = new DietItem(this.getFoodName(foodId));
        }
        if (this.dietItems[foodId].experimentLevel == null || this.dietItems[foodId].experimentLevel > experimentLevel || isManual) {

            //Set dietItems of food Item
            this.dietItems[foodId].setExpLeveL(experimentLevel);

            //Set Reaction of parent if any
            var parentId = this.foodList[foodId]['pid'];
            if (parentId) {
                this.addDietItemExpLevel(parentId, experimentLevel);
            }
            //Set reaction for AKA
            this.getAkaFoods(foodId).forEach(akaid => {
                this.addDietItemExpLevel(akaid, experimentLevel);
            });
            //Set reaction for food in which foodId is ingredient 
            this.getFoodMadeFrom(foodId).forEach(id => {
                this.addDietItemExpLevel(id, experimentLevel);
            });
        }
    }
    addDietItemReactionExpLevel = function(reaction, foodId, experimentLevel) {
        if (!this.foodExist(foodId))
            return;
        if (this.dietItems[foodId] == null) {
            this.dietItems[foodId] = new DietItem(this.getFoodName(foodId));
        }
        if (this.dietItems[foodId].reaction != null) {
            if (this.dietItems[foodId].getHighestReaction() == reaction) {
                if (this.dietItems[foodId].reactionExperimentOverride != experimentLevel) {
                    //Set dietItems of food Item
                    this.dietItems[foodId].setReactionExpOverride(experimentLevel);

                    //Set Reaction of parent if any
                    var parentId = this.foodList[foodId]['pid'];
                    if (parentId) {
                        this.addDietItemReactionExpLevel(parentId, experimentLevel);
                    }
                    //Set reaction for AKA
                    this.getAkaFoods(foodId).forEach(akaid => {
                        this.addDietItemReactionExpLevel(akaid, experimentLevel);
                    });
                    //Set reaction for food in which foodId is ingredient 
                    this.getFoodMadeFrom(foodId).forEach(id => {
                        this.addDietItemReactionExpLevel(id, experimentLevel);
                    });
                }
            }
        }
    }
    applyExperimentationBasedOnReactions = function(reaction, experimentLevel) {
        Object.entries(this.dietItems).forEach(([foodId, dietItem]) => {
            this.addDietItemReactionExpLevel(reaction, foodId, experimentLevel);
        });
    }
    applyAutoImmune = function() {
        this.isAutoImmune = true;
        for (const foodId of this.autoImmuneFoods) {
            // If it is reactive 
            if (this.dietItems[foodId] != null) {
                if (this.dietItems[foodId].reaction != null) {
                    console.log(this.dietItems[foodId]);
                    this.addDietItemExpLevel(foodId, EXP_CODE_ORDER.indexOf('Never'), true);
                }
            }
        }
    }
}