 ///////////////////////////////////////////////////////////////////////////
 ////// Reaction Tests Module  
 ///////////////////////////////////////////////////////////////////////////
 QUnit.module('Reaction Tests');
 QUnit.test('Almond set to IgA2', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA2');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgA, 'IgA2', 'Almond has a reaction type of IgA');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgA, 'IgA2', 'Almond was set to IgA2');
     assert.equal(dietPlannerV2.dietItems[7].getHighestReaction(), 3, 'For Almond: getHighestReaction() returns 3 ~ IgA2');
     assert.equal(dietPlannerV2.dietItems[7].isFoodInDiet(), false, 'The food is not in diet because of reaction.');
 });

 QUnit.test('Check IgE3 and greater are set to NEVER', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgE2');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgE, 'IgE2', 'Almond has a reaction type of IgE');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgE, 'IgE2', 'Almond was set to IgE2');
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 1, 'Almond has "No" experiment level set.');
     dietPlannerV2.addReaction(7, 'IgE3');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgE, 'IgE3', 'Almond was set to IgE3');
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 0, 'Almond was set to IgE3 and its experiment level is "Never"');
 });

 QUnit.test('Almond set to IgA2 and later on reaction was changed to IgG3', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA2');
     dietPlannerV2.addReaction(7, 'IgG3');
     assert.equal(dietPlannerV2.dietItems[7].reaction.IgG, 'IgG3', 'Almond has a reaction type of IgG');
     assert.equal(dietPlannerV2.dietItems[7].getHighestReaction(), 6, 'Almond was set to IgG3');
 });


 ///////////////////////////////////////////////////////////////////////////
 ////// Diet Type / Override Tests Module  
 ///////////////////////////////////////////////////////////////////////////
 QUnit.module('Diet Type / Override Tests');
 QUnit.test('Test setDietType method', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.setDietType(57, 3);
     assert.equal(dietPlannerV2.getSelectedDietType(57).id, 57, 'Diet type set successfully: dietPlannerV2.getSelectedDietType(57).id = 57');
     assert.equal(dietPlannerV2.getSelectedDietType(57).experimentLevel, 3, 'Diet type set successfully: dietPlannerV2.getSelectedDietType(57).experimentLevel = Try');
 });

 QUnit.test('Test adding override to a diet type', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.setDietType(57, 3);
     dietPlannerV2.addDietOverideItem(56, 44, 0);
     assert.equal(dietPlannerV2.getSelectedDietType(57).experimentLevel, 3, 'Set Strong Ragweed Cross Reactors diet type with experiment level Try');
     assert.equal(dietPlannerV2.dietItems[44].getExpLevel(), 0, 'Arrowroot Flour/powder was set to Never and it is Never');
     assert.equal(dietPlannerV2.dietItems[155].getExpLevel(), 0, 'Arrowroot Flour/powder was set to Never and it changed  Cheese, Daiya (Coconut,Tapioca & Yeast) to Never');

     dietPlannerV2.addDietOverideItem(57, 51, 5);
     assert.equal(dietPlannerV2.dietItems[51].getExpLevel(), 5, 'Avocado was successfully set to Occasionally');
 });

 QUnit.test('Child Diet Type Case: Child Diet Type only override its foods.', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.setDietType(67, 1);
     dietPlannerV2.setDietType(66, 4);
     assert.equal(dietPlannerV2.dietItems[88].getExpLevel(), 4, 'Bell Pepper is set to Try becuase of Lectin free diet type');
     assert.equal(dietPlannerV2.dietItems[3].getExpLevel(), 1, 'Agar Gum  remains No because of other diets.');
     assert.equal(dietPlannerV2.dietItems[4].getExpLevel(), 1, 'Agave Nectar  remains No because of other diets.');
     assert.equal(dietPlannerV2.dietItems[116].getExpLevel(), 1, 'Butter, Raw and Pasture-raised remains No because of parent diet.');
 });

 QUnit.test('Parent Diet Type Reset Case', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.setDietType(67, 1);
     dietPlannerV2.setDietType(10, 4);
     dietPlannerV2.setDietType(67, 1);
     assert.equal(dietPlannerV2.dietItems[3].getExpLevel(), 1, 'Agar Gum is set to No becuase of parent Anti-Inflammatory Diet diet type reset');
 });

 ///////////////////////////////////////////////////////////////////////////
 ////// Overrides Test Module  
 ///////////////////////////////////////////////////////////////////////////
 QUnit.module('Overrides Tests');
 QUnit.test('Add override: Override Agar Gum to Rarely', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addOverrideItem(3, 3);
     assert.equal(Object.keys(dietPlannerV2.getAllOverrideItems()).length, 1, 'Has one item set as override.');
     assert.equal(dietPlannerV2.getAllOverrideItems()[3].foodId, 3, 'Agar Gum is set as override.');
     assert.equal(dietPlannerV2.getAllOverrideItems()[3].experimentLevel, 3, 'Agar Gum is set as experiment level Rarely.');
     console.log(dietPlannerV2.getAllOverrideItems()[44]);
 });

 QUnit.test('Remove override', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addOverrideItem(3, 3);
     dietPlannerV2.addOverrideItem(4, 2);
     assert.equal(Object.keys(dietPlannerV2.getAllOverrideItems()).length, 2, 'Successfully added two overrides');
     dietPlannerV2.removeOverrideItems([4]);
     assert.equal(Object.keys(dietPlannerV2.getAllOverrideItems()).length, 1, 'Successfully removed one override');
 });

 QUnit.test('Add override from diet : Override Arrowroot Flour/powder to Try', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.setDietType(57, 3);
     dietPlannerV2.addDietOverideItem(56, 44, 1);
     assert.equal(dietPlannerV2.getSelectedDietType(57).experimentLevel, 3, 'Set Strong Ragweed Cross Reactors diet type with experiment level Try');
     assert.equal(Object.keys(dietPlannerV2.getAllOverrideItems()).length, 1, 'Has one item set as override.');
     assert.equal(dietPlannerV2.getAllOverrideItems()[44].foodId, 44, 'Arrowroot Flour/powder is set as override.');
     assert.equal(dietPlannerV2.getAllOverrideItems()[44].experimentLevel, 1, 'Arrowroot Flour/powder is set as experiment level Try.');
     console.log(dietPlannerV2.getAllOverrideItems()[44]);
 });

 ///////////////////////////////////////////////////////////////////////////
 ////// Autoimmune Tests Module  
 ///////////////////////////////////////////////////////////////////////////
 QUnit.module('Autoimmune Tests');
 QUnit.test('Set Almond to IgA1 and enable autoimmune.', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA1');
     dietPlannerV2.setAutoImmune(true);

     assert.equal(dietPlannerV2.hasAutoImmuneIssues(), true, 'Sucessfully enabled hasAutoImmuneIssues check');
     assert.equal(dietPlannerV2.dietItems[8816].experimentLevel, 0, 'Birch Benders Pancake & Waffle Mix, Keto is set to Never because of Autoimmne Yes');
     assert.equal(dietPlannerV2.dietItems[8815].experimentLevel, null, 'Birch Benders Paleo Pancake Waffle Mix has no experiment level because of Autoimmne No');
 });

 QUnit.test('Test experiment by reaction method call for IgG1 was set for Almond, IgG1 set to Rarely', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA1');
     dietPlannerV2.setAutoImmune(true);

     assert.equal(dietPlannerV2.hasAutoImmuneIssues(), true, 'Sucessfully enabled hasAutoImmuneIssues check');
     assert.equal(dietPlannerV2.dietItems[8816].experimentLevel, 0, 'Birch Benders Pancake & Waffle Mix, Keto is set to Never because of Autoimmne Yes');

     dietPlannerV2.addOverrideItem(8816, 3);
     assert.equal(dietPlannerV2.dietItems[8816].experimentLevel, 0, 'Birch Benders Pancake & Waffle Mix, Keto is remain Never, manual override option does not replace AutoImmune.');
 });

 ///////////////////////////////////////////////////////////////////////////
 ////// Experiment by reaction Tests Module  
 ///////////////////////////////////////////////////////////////////////////
 QUnit.module('Experiment by reaction Tests');
 QUnit.test('Test experiment by reaction method call for IgG1 was set for Almond, IgG1 set to Rarely', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA1'); //Set reaction on almond
     dietPlannerV2.addOverrideItem(99, 3);
     var sliderRanges = {
         "Never": [],
         "No": ["IgG2", "IgA3", "IgG3", "IgA4", "IgG4", "IgA5", "IgG5", "IgA6", "IgG6", "IgA7", "IgG7", "IgE0/1", "IgE1", "IgE2", "IgE3", "IgE4", "IgE5", "IgE6", "IgE7"],
         "Rarely": ["IgA1", "IgG1", "IgA2"],
         "Try": [],
         "Occasionally": [],
         "Allow": []
     };
     dietPlannerV2.setExperimentLevelByReactions(sliderRanges);
     assert.equal(dietPlannerV2.dietItems[7].isFoodInDiet(), true, 'Almond is in diet because of IgG1 is set to Try.');
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 2, 'Almond is set to Rarely because of IgG1 is set to Rarely.');
 });
 QUnit.test('Experiment by reaction will override when called for same twice.', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA1'); //Set reaction on almond
     var sliderRanges = {
         "Never": [],
         "No": ["IgG2", "IgA3", "IgG3", "IgA4", "IgG4", "IgA5", "IgG5", "IgA6", "IgG6", "IgA7", "IgG7", "IgE0/1", "IgE1", "IgE2", "IgE3", "IgE4", "IgE5", "IgE6", "IgE7"],
         "Rarely": [],
         "Try": ["IgA1", "IgG1", "IgA2"],
         "Occasionally": [],
         "Allow": []
     };
     dietPlannerV2.setExperimentLevelByReactions(sliderRanges);
     assert.equal(dietPlannerV2.dietItems[7].isFoodInDiet(), true, 'Almond is in diet because of IgA1 is set to Try.');
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 3, 'Almond is set to Try because of IgA1 is set to Try.');
     sliderRanges = {
         "Never": [],
         "No": ["IgG2", "IgA3", "IgG3", "IgA4", "IgG4", "IgA5", "IgG5", "IgA6", "IgG6", "IgA7", "IgG7", "IgE0/1", "IgE1", "IgE2", "IgE3", "IgE4", "IgE5", "IgE6", "IgE7"],
         "Rarely": ["IgA1", "IgG1", "IgA2"],
         "Try": [],
         "Occasionally": [],
         "Allow": []
     };
     dietPlannerV2.setExperimentLevelByReactions(sliderRanges);
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 2, 'Almond is set to Try because of IgA1 is set to Try.');
 });
 QUnit.test('Experiment will not override diet type experiment level.', function(assert) {
     var dietPlannerV2 = createDietPlannerV2Mock();
     dietPlannerV2.addReaction(7, 'IgA2'); //Set reaction on almond
     dietPlannerV2.setDietType(67, 1); // Set diet type on almond with experiment level 1 , this will sustain
     dietPlannerV2.addOverrideItem(99, 3);
     const sliderRanges = {
         "Never": [],
         "No": ["IgG2", "IgA3", "IgG3", "IgA4", "IgG4", "IgA5", "IgG5", "IgA6", "IgG6", "IgA7", "IgG7", "IgE0/1", "IgE1", "IgE2", "IgE3", "IgE4", "IgE5", "IgE6", "IgE7"],
         "Try": ["IgA1", "IgG1", "IgA2"],
         "Rarely": [],
         "Occasionally": [],
         "Allow": []
     };
     dietPlannerV2.setExperimentLevelByReactions(sliderRanges);
     assert.equal(dietPlannerV2.dietItems[7].isFoodInDiet(), false, 'Almond is out of diet because of diet type.');
     assert.equal(dietPlannerV2.dietItems[7].getExpLevel(), 1, 'Almond has experimentLevel = No');
     assert.equal(dietPlannerV2.dietItems[99].getExpLevel(), 3, 'BodyPro Almond Mayo with Yacon Syrup has experimentLevel = Rarely');
 });