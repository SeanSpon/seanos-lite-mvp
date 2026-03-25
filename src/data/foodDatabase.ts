import type { FoodItem } from '@/types';

export const FOOD_DATABASE: FoodItem[] = [
  // === PROTEIN ===
  { id: 'chicken-breast', name: 'Chicken Breast (grilled)', servingSize: '4 oz', calories: 187, protein: 35, carbs: 0, fat: 4, fiber: 0, category: 'protein' },
  { id: 'ground-beef-90', name: 'Ground Beef 90/10', servingSize: '4 oz', calories: 200, protein: 22, carbs: 0, fat: 11, fiber: 0, category: 'protein' },
  { id: 'salmon', name: 'Salmon Fillet', servingSize: '4 oz', calories: 234, protein: 25, carbs: 0, fat: 14, fiber: 0, category: 'protein' },
  { id: 'eggs', name: 'Eggs (whole)', servingSize: '2 large', calories: 143, protein: 13, carbs: 1, fat: 10, fiber: 0, category: 'protein' },
  { id: 'egg-whites', name: 'Egg Whites', servingSize: '4 large', calories: 68, protein: 14, carbs: 1, fat: 0, fiber: 0, category: 'protein' },
  { id: 'turkey-breast', name: 'Turkey Breast (sliced)', servingSize: '4 oz', calories: 120, protein: 26, carbs: 0, fat: 1, fiber: 0, category: 'protein' },
  { id: 'tuna-canned', name: 'Tuna (canned in water)', servingSize: '1 can', calories: 120, protein: 27, carbs: 0, fat: 1, fiber: 0, category: 'protein' },
  { id: 'shrimp', name: 'Shrimp', servingSize: '4 oz', calories: 120, protein: 23, carbs: 1, fat: 2, fiber: 0, category: 'protein' },
  { id: 'steak-sirloin', name: 'Sirloin Steak', servingSize: '6 oz', calories: 320, protein: 44, carbs: 0, fat: 15, fiber: 0, category: 'protein' },
  { id: 'protein-shake', name: 'Whey Protein Shake', servingSize: '1 scoop + water', calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, category: 'protein' },

  // === GRAINS / CARBS ===
  { id: 'white-rice', name: 'White Rice (cooked)', servingSize: '1 cup', calories: 206, protein: 4, carbs: 45, fat: 0, fiber: 1, category: 'grain' },
  { id: 'brown-rice', name: 'Brown Rice (cooked)', servingSize: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4, category: 'grain' },
  { id: 'oatmeal', name: 'Oatmeal', servingSize: '1 cup cooked', calories: 154, protein: 5, carbs: 27, fat: 3, fiber: 4, category: 'grain' },
  { id: 'bread-wheat', name: 'Whole Wheat Bread', servingSize: '2 slices', calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 4, category: 'grain' },
  { id: 'pasta', name: 'Pasta (cooked)', servingSize: '1 cup', calories: 220, protein: 8, carbs: 43, fat: 1, fiber: 3, category: 'grain' },
  { id: 'tortilla', name: 'Flour Tortilla (large)', servingSize: '1 tortilla', calories: 210, protein: 5, carbs: 36, fat: 5, fiber: 2, category: 'grain' },
  { id: 'cereal', name: 'Cereal (generic)', servingSize: '1 cup', calories: 150, protein: 3, carbs: 34, fat: 1, fiber: 3, category: 'grain' },
  { id: 'bagel', name: 'Bagel (plain)', servingSize: '1 bagel', calories: 270, protein: 10, carbs: 53, fat: 2, fiber: 2, category: 'grain' },

  // === FRUITS ===
  { id: 'banana', name: 'Banana', servingSize: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, category: 'fruit' },
  { id: 'apple', name: 'Apple', servingSize: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, category: 'fruit' },
  { id: 'blueberries', name: 'Blueberries', servingSize: '1 cup', calories: 85, protein: 1, carbs: 21, fat: 0, fiber: 4, category: 'fruit' },
  { id: 'strawberries', name: 'Strawberries', servingSize: '1 cup', calories: 49, protein: 1, carbs: 12, fat: 0, fiber: 3, category: 'fruit' },
  { id: 'orange', name: 'Orange', servingSize: '1 medium', calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, category: 'fruit' },

  // === VEGETABLES ===
  { id: 'broccoli', name: 'Broccoli', servingSize: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 0, fiber: 5, category: 'vegetable' },
  { id: 'spinach', name: 'Spinach (raw)', servingSize: '2 cups', calories: 14, protein: 2, carbs: 2, fat: 0, fiber: 1, category: 'vegetable' },
  { id: 'sweet-potato', name: 'Sweet Potato', servingSize: '1 medium', calories: 103, protein: 2, carbs: 24, fat: 0, fiber: 4, category: 'vegetable' },
  { id: 'mixed-veggies', name: 'Mixed Vegetables', servingSize: '1 cup', calories: 80, protein: 4, carbs: 15, fat: 0, fiber: 5, category: 'vegetable' },

  // === DAIRY ===
  { id: 'greek-yogurt', name: 'Greek Yogurt (plain)', servingSize: '1 cup', calories: 130, protein: 22, carbs: 8, fat: 0, fiber: 0, category: 'dairy' },
  { id: 'milk-whole', name: 'Whole Milk', servingSize: '1 cup', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, category: 'dairy' },
  { id: 'cheese-cheddar', name: 'Cheddar Cheese', servingSize: '1 oz', calories: 113, protein: 7, carbs: 0, fat: 9, fiber: 0, category: 'dairy' },
  { id: 'cottage-cheese', name: 'Cottage Cheese', servingSize: '1 cup', calories: 206, protein: 28, carbs: 8, fat: 9, fiber: 0, category: 'dairy' },

  // === SNACKS ===
  { id: 'almonds', name: 'Almonds', servingSize: '1 oz (23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 4, category: 'snack' },
  { id: 'peanut-butter', name: 'Peanut Butter', servingSize: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, category: 'snack' },
  { id: 'protein-bar', name: 'Protein Bar', servingSize: '1 bar', calories: 210, protein: 20, carbs: 22, fat: 7, fiber: 3, category: 'snack' },
  { id: 'trail-mix', name: 'Trail Mix', servingSize: '1/4 cup', calories: 175, protein: 5, carbs: 15, fat: 12, fiber: 2, category: 'snack' },
  { id: 'granola-bar', name: 'Granola Bar', servingSize: '1 bar', calories: 140, protein: 3, carbs: 25, fat: 4, fiber: 2, category: 'snack' },

  // === DRINKS ===
  { id: 'coffee-black', name: 'Coffee (black)', servingSize: '1 cup', calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'drink' },
  { id: 'orange-juice', name: 'Orange Juice', servingSize: '1 cup', calories: 112, protein: 2, carbs: 26, fat: 0, fiber: 0, category: 'drink' },
  { id: 'chocolate-milk', name: 'Chocolate Milk', servingSize: '1 cup', calories: 208, protein: 8, carbs: 26, fat: 8, fiber: 2, category: 'drink' },
  { id: 'sports-drink', name: 'Sports Drink (Gatorade)', servingSize: '20 oz', calories: 140, protein: 0, carbs: 36, fat: 0, fiber: 0, category: 'drink' },
  { id: 'energy-drink', name: 'Energy Drink', servingSize: '1 can', calories: 110, protein: 0, carbs: 28, fat: 0, fiber: 0, category: 'drink' },

  // === FAST FOOD / MEALS ===
  { id: 'qdoba-bowl', name: 'Qdoba Burrito Bowl', brand: 'Qdoba', servingSize: '1 bowl', calories: 680, protein: 42, carbs: 62, fat: 24, fiber: 10, category: 'meal' },
  { id: 'chickfila-sandwich', name: 'Chicken Sandwich', brand: 'Chick-fil-A', servingSize: '1 sandwich', calories: 440, protein: 28, carbs: 40, fat: 19, fiber: 1, category: 'meal' },
  { id: 'chickfila-nuggets', name: 'Chicken Nuggets (12pc)', brand: 'Chick-fil-A', servingSize: '12 piece', calories: 380, protein: 40, carbs: 14, fat: 18, fiber: 0, category: 'meal' },
  { id: 'pbj', name: 'PB&J Sandwich', servingSize: '1 sandwich', calories: 376, protein: 13, carbs: 50, fat: 17, fiber: 4, category: 'meal' },
  { id: 'chipotle-bowl', name: 'Chipotle Bowl', brand: 'Chipotle', servingSize: '1 bowl', calories: 720, protein: 46, carbs: 68, fat: 28, fiber: 12, category: 'meal' },
  { id: 'subway-6inch', name: 'Subway 6-inch Turkey', brand: 'Subway', servingSize: '6 inch', calories: 280, protein: 18, carbs: 46, fat: 3, fiber: 5, category: 'meal' },
  { id: 'pizza-slice', name: 'Pizza Slice (cheese)', servingSize: '1 large slice', calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, category: 'meal' },
  { id: 'mcdonalds-mcchicken', name: 'McChicken', brand: "McDonald's", servingSize: '1 sandwich', calories: 400, protein: 14, carbs: 40, fat: 21, fiber: 1, category: 'meal' },
];

export const EXERCISE_LIBRARY = [
  // Chest
  { name: 'Bench Press', muscleGroup: 'Chest' },
  { name: 'Incline Bench Press', muscleGroup: 'Chest' },
  { name: 'Dumbbell Flys', muscleGroup: 'Chest' },
  { name: 'Push-ups', muscleGroup: 'Chest' },
  { name: 'Cable Crossover', muscleGroup: 'Chest' },
  // Back
  { name: 'Pull-ups', muscleGroup: 'Back' },
  { name: 'Lat Pulldown', muscleGroup: 'Back' },
  { name: 'Barbell Row', muscleGroup: 'Back' },
  { name: 'Dumbbell Row', muscleGroup: 'Back' },
  { name: 'Deadlift', muscleGroup: 'Back' },
  { name: 'Cable Row', muscleGroup: 'Back' },
  // Shoulders
  { name: 'Overhead Press', muscleGroup: 'Shoulders' },
  { name: 'Lateral Raises', muscleGroup: 'Shoulders' },
  { name: 'Front Raises', muscleGroup: 'Shoulders' },
  { name: 'Face Pulls', muscleGroup: 'Shoulders' },
  // Arms
  { name: 'Bicep Curls', muscleGroup: 'Arms' },
  { name: 'Hammer Curls', muscleGroup: 'Arms' },
  { name: 'Tricep Pushdown', muscleGroup: 'Arms' },
  { name: 'Skull Crushers', muscleGroup: 'Arms' },
  { name: 'Tricep Dips', muscleGroup: 'Arms' },
  // Legs
  { name: 'Squat', muscleGroup: 'Legs' },
  { name: 'Leg Press', muscleGroup: 'Legs' },
  { name: 'Lunges', muscleGroup: 'Legs' },
  { name: 'Leg Extension', muscleGroup: 'Legs' },
  { name: 'Leg Curl', muscleGroup: 'Legs' },
  { name: 'Calf Raises', muscleGroup: 'Legs' },
  { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
  // Core
  { name: 'Plank', muscleGroup: 'Core' },
  { name: 'Crunches', muscleGroup: 'Core' },
  { name: 'Russian Twists', muscleGroup: 'Core' },
  { name: 'Leg Raises', muscleGroup: 'Core' },
  { name: 'Ab Wheel', muscleGroup: 'Core' },
  // Cardio
  { name: 'Running', muscleGroup: 'Cardio' },
  { name: 'Cycling', muscleGroup: 'Cardio' },
  { name: 'Jump Rope', muscleGroup: 'Cardio' },
  { name: 'Rowing Machine', muscleGroup: 'Cardio' },
  { name: 'Stair Climber', muscleGroup: 'Cardio' },
  { name: 'Walking', muscleGroup: 'Cardio' },
];
