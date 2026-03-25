// src/types/menu.types.ts
// Enums matching backend
export var DietaryType;
(function (DietaryType) {
    DietaryType["VEG"] = "VEG";
    DietaryType["EGG"] = "EGG";
    DietaryType["NON_VEG"] = "NON_VEG";
    DietaryType["JAIN"] = "JAIN";
    DietaryType["VEGAN"] = "VEGAN";
    DietaryType["GLUTEN_FREE"] = "GLUTEN_FREE";
})(DietaryType || (DietaryType = {}));
export var NutritionTag;
(function (NutritionTag) {
    NutritionTag["HIGH_PROTEIN"] = "HIGH_PROTEIN";
    NutritionTag["LOW_CALORIES"] = "LOW_CALORIES";
    NutritionTag["LOW_FAT"] = "LOW_FAT";
    NutritionTag["LOW_SUGAR"] = "LOW_SUGAR";
    NutritionTag["HIGH_FIBER"] = "HIGH_FIBER";
    NutritionTag["KETO_FRIENDLY"] = "KETO_FRIENDLY";
    NutritionTag["LOW_CARB"] = "LOW_CARB";
})(NutritionTag || (NutritionTag = {}));
export var Allergen;
(function (Allergen) {
    Allergen["DAIRY"] = "DAIRY";
    Allergen["GLUTEN"] = "GLUTEN";
    Allergen["PEANUTS"] = "PEANUTS";
    Allergen["TREE_NUTS"] = "TREE_NUTS";
    Allergen["EGGS"] = "EGGS";
    Allergen["SOY"] = "SOY";
    Allergen["SESAME"] = "SESAME";
    Allergen["FISH"] = "FISH";
    Allergen["SHELLFISH"] = "SHELLFISH";
    Allergen["MUSTARD"] = "MUSTARD";
    Allergen["ALLIUM"] = "ALLIUM";
})(Allergen || (Allergen = {}));
export var DrinkTemperature;
(function (DrinkTemperature) {
    DrinkTemperature["HOT"] = "HOT";
    DrinkTemperature["COLD"] = "COLD";
})(DrinkTemperature || (DrinkTemperature = {}));
export var DrinkAlcoholContent;
(function (DrinkAlcoholContent) {
    DrinkAlcoholContent["ALCOHOLIC"] = "ALCOHOLIC";
    DrinkAlcoholContent["NON_ALCOHOLIC"] = "NON_ALCOHOLIC";
})(DrinkAlcoholContent || (DrinkAlcoholContent = {}));
export var DrinkCaffeineContent;
(function (DrinkCaffeineContent) {
    DrinkCaffeineContent["CAFFEINATED"] = "CAFFEINATED";
    DrinkCaffeineContent["NON_CAFFEINATED"] = "NON_CAFFEINATED";
})(DrinkCaffeineContent || (DrinkCaffeineContent = {}));
// Helper type for displaying allergen labels
export const AllergenLabels = {
    [Allergen.DAIRY]: 'Dairy',
    [Allergen.GLUTEN]: 'Gluten',
    [Allergen.PEANUTS]: 'Peanuts',
    [Allergen.TREE_NUTS]: 'Tree Nuts',
    [Allergen.EGGS]: 'Eggs',
    [Allergen.SOY]: 'Soy',
    [Allergen.SESAME]: 'Sesame',
    [Allergen.FISH]: 'Fish',
    [Allergen.SHELLFISH]: 'Shellfish',
    [Allergen.MUSTARD]: 'Mustard',
    [Allergen.ALLIUM]: 'Allium (Onion/Garlic)',
};
// Helper type for displaying nutrition tag labels
export const NutritionTagLabels = {
    [NutritionTag.HIGH_PROTEIN]: 'High Protein',
    [NutritionTag.LOW_CALORIES]: 'Low Calories',
    [NutritionTag.LOW_FAT]: 'Low Fat',
    [NutritionTag.LOW_SUGAR]: 'Low Sugar',
    [NutritionTag.HIGH_FIBER]: 'High Fiber',
    [NutritionTag.KETO_FRIENDLY]: 'Keto Friendly',
    [NutritionTag.LOW_CARB]: 'Low Carb',
};
// Helper type for displaying dietary type labels
export const DietaryTypeLabels = {
    [DietaryType.VEG]: 'Vegetarian',
    [DietaryType.EGG]: 'Eggitarian',
    [DietaryType.NON_VEG]: 'Non-Vegetarian',
    [DietaryType.JAIN]: 'Jain',
    [DietaryType.VEGAN]: 'Vegan',
    [DietaryType.GLUTEN_FREE]: 'Gluten Free',
};
// Helper type for displaying drink temperature labels
export const DrinkTemperatureLabels = {
    [DrinkTemperature.HOT]: 'Hot',
    [DrinkTemperature.COLD]: 'Cold',
};
// Helper type for displaying alcohol content labels
export const DrinkAlcoholContentLabels = {
    [DrinkAlcoholContent.ALCOHOLIC]: 'Alcoholic',
    [DrinkAlcoholContent.NON_ALCOHOLIC]: 'Non-Alcoholic',
};
// Helper type for displaying caffeine content labels
export const DrinkCaffeineContentLabels = {
    [DrinkCaffeineContent.CAFFEINATED]: 'Caffeinated',
    [DrinkCaffeineContent.NON_CAFFEINATED]: 'Non-Caffeinated',
};
// Helper type for dietary type icons/emojis
export const DietaryTypeIcons = {
    [DietaryType.VEG]: '🟢',
    [DietaryType.EGG]: '🟡',
    [DietaryType.NON_VEG]: '🔴',
    [DietaryType.JAIN]: '🟣',
    [DietaryType.VEGAN]: '🌱',
    [DietaryType.GLUTEN_FREE]: '🌾',
};
// Utility function to format enum values to readable strings
export const formatEnumValue = (value) => {
    return value
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};
