class EventManager {
    constructor(dietPlannerV2) {
        this.dietPlannerV2 = dietPlannerV2;
        this.counter = new Counter();
    }

    handleEvent(eventType, data) {
        switch (eventType) {
            case "setReaction":
                this.setReactionEvent(data);
                break;
            case "setDietType":
                this.setDietTypeEvent(data);
                break;
            case "addDietOverideItem":
                this.addDietOverideItemEvent(data);
                break;
            case "removeOverrideItems":
                this.removeOverrideItemsEvent(data);
                break;
            case "addOverrideItem":
                this.addOverrideItemEvent(data);
                break;
            case "setExperimentLevelByReactions":
                this.setExperimentLevelByReactionsEvent(data);
                break;
            case "removeDietType":
                this.removeDietTypeEvent(data);
                break;
            case "setAutoImmune":
                this.setAutoImmuneEvent(data);
                break;
        }
        var afterEventChanges = this.run();
        return afterEventChanges;
    }

    run() {
        var previousDietItems = this.dietPlannerV2.getAllDietItems();
        this.dietPlannerV2.resetDiet();
        var eventsObject = this.dietPlannerV2.events;
        for (const id in events) {
            events[id].type = id.split('-')[0];
        };
        var events = Object.values(eventsObject);
        var sortedEvents = events.sort((a, b) => a.squenceNumber - b.squenceNumber);

        for (const event of sortedEvents) {
            var data = event.data;
            switch (event.type) {
                case "reaction":
                    var reactionId = REACTION_ORDER.indexOf(event.reaction);
                    this.dietPlannerV2.addDietItemReaction(event.foodId, reactionId);
                    break;
                case "diet_type":
                    this.addDietTypeSelected(event.dietTypeId, event.experimentLevel);
                    this.dietPlannerV2.addDietType(event.dietTypeId, event.experimentLevel);
                    break;
            }
        }

        for (const event of sortedEvents) {
            var data = event.data;
            switch (event.type) {
                case "reaction_experiment":
                    this.dietPlannerV2.applyExperimentationBasedOnReactions(event.reaction, event.experimentLevel);
                    break;
                case "autoImmune":
                    this.dietPlannerV2.applyAutoImmune();
                    break;
            }
        }
        for (const event of sortedEvents) {
            var data = event.data;
            switch (event.type) {
                case "override":
                    this.dietPlannerV2.addDietItemExpLevel(event.foodId, event.experimentLevel, true);
                    this.dietPlannerV2.addDietItemReactionExpLevel(event.foodId, event.experimentLevel);
                    break;
            }
        }
        if (sortedEvents.length > 0) {
            var lastSquenceNumber = sortedEvents[sortedEvents.length - 1].squenceNumber;
            var lastEventId = Object.keys(eventsObject).find(key => eventsObject[key].squenceNumber === lastSquenceNumber);
            var lastEventDescription = eventsObject[lastEventId].description;
        } else {
            var lastEventId = 0;
            var lastEventDescription = '';
        }

        var currentDietItems = this.dietPlannerV2.getAllDietItems();
        var lastEventChanges = this.compareDietItems(currentDietItems, previousDietItems);

        // console.log({ id: lastEventId, description: lastEventDescription, changes: lastEventChanges });
        return { id: lastEventId, description: lastEventDescription, changes: lastEventChanges };

    }

    setReactionEvent = function(data) {
        this.dietPlannerV2.events[`reaction-${data.foodId}`] = {
            squenceNumber: this.counter.getNext(),
            type: 'reaction',
            foodId: data.foodId,
            reaction: data.reaction,
            description: `Set ${data.reaction} reaction for ${this.dietPlannerV2.getFoodName(data.foodId)}`,
        };
    }

    setDietTypeEvent = function(data) {
        this.dietPlannerV2.events[`diet_type-${data.dietTypeId}`] = {
            squenceNumber: this.counter.getNext(),
            type: 'diet_type',
            dietTypeId: data.dietTypeId,
            experimentLevel: data.experimentLevel,
            description: `Set ${this.dietPlannerV2.getDietType(data.dietTypeId).name} diet type with experiment level ${EXP_CODE_ORDER[data.experimentLevel]}`,
        };
    }

    removeDietTypeEvent = function(dietTypeId) {
        delete this.dietPlannerV2.events[`diet_type-${dietTypeId}`];
        delete this.dietPlannerV2.dietTypesSelected[dietTypeId];
        var childDiets = this.dietPlannerV2.getChildDiets(dietTypeId);
        childDiets.forEach(childDiet => {
            delete this.dietPlannerV2.dietTypesSelected[childDiet.DTIDC];
        });
        //If parent diet is set it will override child diets and remove its manual overrides, so we remove events.
        this.removeChildDiets(dietTypeId);
    }

    addDietOverideItemEvent = function(data) {
        var overrideItem = data.overrideItem;
        this.dietPlannerV2.dietTypesSelected[data.dietTypeId].addManualOverideItem(overrideItem);
        this.dietPlannerV2.events[`override-${overrideItem.foodId }`] = {
            squenceNumber: this.counter.getNext(),
            type: 'override',
            foodId: overrideItem.foodId,
            experimentLevel: overrideItem.experimentLevel,
            description: `Override  ${overrideItem.foodName} food experiment level to ${EXP_CODE_ORDER[overrideItem.experimentLevel]}`,
        };
    }

    addOverrideItemEvent = function(data) {
        this.dietPlannerV2.events[`override-${data.foodId}`] = {
            squenceNumber: this.counter.getNext(),
            type: 'override',
            foodId: data.foodId,
            experimentLevel: data.experimentLevel,
            description: `Override ${this.dietPlannerV2.getFoodName(data.foodId)} food experiment level to ${EXP_CODE_ORDER[data.experimentLevel]}`,
        };
    }

    removeOverrideItemsEvent = function(foodIdArray) {
        foodIdArray.forEach(foodId => delete this.dietPlannerV2.events[`override-${foodId}`]);
    }

    setExperimentLevelByReactionsEvent = function(data) {
        Object.entries(data).forEach(([experimentLevel, reactionList]) => {
            for (const reaction of reactionList) {
                if (experimentLevel != 'No') {
                    this.dietPlannerV2.events[`reaction_experiment-${reaction }`] = {
                        squenceNumber: this.counter.getNext(),
                        type: 'reaction_experiment',
                        reaction: REACTION_ORDER.indexOf(reaction),
                        experimentLevel: EXP_CODE_ORDER.indexOf(experimentLevel),
                        description: `Override ${reaction} reactive foods to experiment level ${experimentLevel}`
                    }
                } else {
                    if (this.dietPlannerV2.events[`reaction_experiment-${reaction }`])
                        delete this.dietPlannerV2.events[`reaction_experiment-${reaction }`];
                }
            }
        });

    }

    setAutoImmuneEvent = function(isAutoImmune) {
        if (isAutoImmune) {
            this.dietPlannerV2.events[`autoImmune`] = {
                squenceNumber: this.counter.getNext(),
                type: 'autoImmune',
                isAutoImmune: isAutoImmune,
                description: `This person has auto immune issues${isAutoImmune}.`,
            };
        } else {
            if (this.dietPlannerV2.events[`autoImmune`])
                delete this.dietPlannerV2.events[`autoImmune`];
        }
    }

    removeChildDiets = function(dietTypeId) {
        var childDiets = this.dietPlannerV2.getChildDiets(dietTypeId);
        childDiets.forEach(childDiet => {
            var childDietId = childDiet.DTIDC;
            if (this.dietPlannerV2.events[`diet_type-${childDietId}`]) {
                this.removeChildDiet(childDietId);
            }
        });
    }
    removeChildDiet(childDietId) {
        //Remove overide fooditems
        var foodItems = this.dietPlannerV2.dietTypesList[childDietId].fooditems;
        foodItems.forEach(foodItem => {
            delete this.dietPlannerV2.events[`override-${foodItem.FID}`];
        });
        //Remove diet
        delete this.dietPlannerV2.events[`diet_type-${childDietId}`];
        delete this.dietPlannerV2.dietTypesSelected[childDietId];
    }

    getLastEventId = function() {
        return 0;
    }
    compareDietItems = function(currentDietItems, previousDietItems) {
        var itemsAddedToDiet = {};
        var itemsRemovedFromDiet = {};
        // Create a set of all item IDs from both sets
        var allItemIds = new Set([...Object.keys(currentDietItems), ...Object.keys(previousDietItems)]);
        allItemIds.forEach(itemId => {
            var currentItem = currentDietItems[itemId];
            var previousItem = previousDietItems[itemId];
            var isFoodInDiet = {
                previous: (previousItem) ? previousItem.isFoodInDiet() : true,
                current: (currentItem) ? currentItem.isFoodInDiet() : true
            }
            if (isFoodInDiet.current != isFoodInDiet.previous) {
                var changedItem = {
                    name: (previousItem) ? previousItem.name : currentItem.name,
                    experimentLevel: {
                        previous: (previousItem) ? EXP_CODE_ORDER[previousItem.experimentLevel] : '',
                        current: (currentItem) ? EXP_CODE_ORDER[currentItem.experimentLevel] : ''
                    },
                    reaction: {
                        previous: (previousItem) ? REACTION_ORDER[previousItem.getHighestReaction()] : 'None',
                        current: (currentItem) ? REACTION_ORDER[currentItem.getHighestReaction()] : 'None'
                    },
                    isFoodInDiet: isFoodInDiet
                }
                if (isFoodInDiet.current == true) {
                    itemsAddedToDiet[itemId] = changedItem;
                } else {
                    itemsRemovedFromDiet[itemId] = changedItem;
                }
            }
        });
        return { itemsAddedToDiet: itemsAddedToDiet, itemsRemovedFromDiet: itemsRemovedFromDiet };
    }

    addDietTypeSelected = function(dietTypeId, experimentLevel) {
        this.dietPlannerV2.dietTypesSelected[dietTypeId] = new DietType(dietTypeId, experimentLevel);
        var childDiets = this.dietPlannerV2.getDietType(dietTypeId).childs;
        childDiets.forEach(childDiet => {
            this.dietPlannerV2.dietTypesSelected[childDiet.DTIDC] = new DietType(childDiet.DTIDC, experimentLevel);
        });
    }
}