import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SeanOS database...');

  // Create default user
  const user = await prisma.user.upsert({
    where: { email: 'sean@seanos.app' },
    update: {},
    create: {
      name: 'Sean',
      email: 'sean@seanos.app',
      calorieGoal: 3000,
      proteinGoal: 160,
      carbGoal: 375,
      fatGoal: 80,
      fiberGoal: 30,
      waterGoal: 8,
      stepsGoal: 10000,
    },
  });
  console.log(`User created: ${user.name} (${user.id})`);

  // Seed Food Database
  const foods = [
    // Protein
    { name: 'Chicken Breast (grilled)', servingSize: '4 oz', calories: 187, protein: 35, carbs: 0, fat: 4, fiber: 0, category: 'protein' },
    { name: 'Ground Beef 90/10', servingSize: '4 oz', calories: 200, protein: 22, carbs: 0, fat: 11, fiber: 0, category: 'protein' },
    { name: 'Salmon Fillet', servingSize: '4 oz', calories: 234, protein: 25, carbs: 0, fat: 14, fiber: 0, category: 'protein' },
    { name: 'Eggs (whole)', servingSize: '2 large', calories: 143, protein: 13, carbs: 1, fat: 10, fiber: 0, category: 'protein' },
    { name: 'Egg Whites', servingSize: '4 large', calories: 68, protein: 14, carbs: 1, fat: 0, fiber: 0, category: 'protein' },
    { name: 'Turkey Breast (sliced)', servingSize: '4 oz', calories: 120, protein: 26, carbs: 0, fat: 1, fiber: 0, category: 'protein' },
    { name: 'Tuna (canned in water)', servingSize: '1 can', calories: 120, protein: 27, carbs: 0, fat: 1, fiber: 0, category: 'protein' },
    { name: 'Shrimp', servingSize: '4 oz', calories: 120, protein: 23, carbs: 1, fat: 2, fiber: 0, category: 'protein' },
    { name: 'Sirloin Steak', servingSize: '6 oz', calories: 320, protein: 44, carbs: 0, fat: 15, fiber: 0, category: 'protein' },
    { name: 'Whey Protein Shake', servingSize: '1 scoop + water', calories: 120, protein: 24, carbs: 3, fat: 1, fiber: 0, category: 'protein' },
    // Grains / Carbs
    { name: 'White Rice (cooked)', servingSize: '1 cup', calories: 206, protein: 4, carbs: 45, fat: 0, fiber: 1, category: 'grain' },
    { name: 'Brown Rice (cooked)', servingSize: '1 cup', calories: 216, protein: 5, carbs: 45, fat: 2, fiber: 4, category: 'grain' },
    { name: 'Oatmeal', servingSize: '1 cup cooked', calories: 154, protein: 5, carbs: 27, fat: 3, fiber: 4, category: 'grain' },
    { name: 'Whole Wheat Bread', servingSize: '2 slices', calories: 160, protein: 8, carbs: 28, fat: 2, fiber: 4, category: 'grain' },
    { name: 'Pasta (cooked)', servingSize: '1 cup', calories: 220, protein: 8, carbs: 43, fat: 1, fiber: 3, category: 'grain' },
    { name: 'Flour Tortilla (large)', servingSize: '1 tortilla', calories: 210, protein: 5, carbs: 36, fat: 5, fiber: 2, category: 'grain' },
    { name: 'Cereal (generic)', servingSize: '1 cup', calories: 150, protein: 3, carbs: 34, fat: 1, fiber: 3, category: 'grain' },
    { name: 'Bagel (plain)', servingSize: '1 bagel', calories: 270, protein: 10, carbs: 53, fat: 2, fiber: 2, category: 'grain' },
    // Fruits
    { name: 'Banana', servingSize: '1 medium', calories: 105, protein: 1, carbs: 27, fat: 0, fiber: 3, category: 'fruit' },
    { name: 'Apple', servingSize: '1 medium', calories: 95, protein: 0, carbs: 25, fat: 0, fiber: 4, category: 'fruit' },
    { name: 'Blueberries', servingSize: '1 cup', calories: 85, protein: 1, carbs: 21, fat: 0, fiber: 4, category: 'fruit' },
    { name: 'Strawberries', servingSize: '1 cup', calories: 49, protein: 1, carbs: 12, fat: 0, fiber: 3, category: 'fruit' },
    { name: 'Orange', servingSize: '1 medium', calories: 62, protein: 1, carbs: 15, fat: 0, fiber: 3, category: 'fruit' },
    // Vegetables
    { name: 'Broccoli', servingSize: '1 cup', calories: 55, protein: 4, carbs: 11, fat: 0, fiber: 5, category: 'vegetable' },
    { name: 'Spinach (raw)', servingSize: '2 cups', calories: 14, protein: 2, carbs: 2, fat: 0, fiber: 1, category: 'vegetable' },
    { name: 'Sweet Potato', servingSize: '1 medium', calories: 103, protein: 2, carbs: 24, fat: 0, fiber: 4, category: 'vegetable' },
    { name: 'Mixed Vegetables', servingSize: '1 cup', calories: 80, protein: 4, carbs: 15, fat: 0, fiber: 5, category: 'vegetable' },
    // Dairy
    { name: 'Greek Yogurt (plain)', servingSize: '1 cup', calories: 130, protein: 22, carbs: 8, fat: 0, fiber: 0, category: 'dairy' },
    { name: 'Whole Milk', servingSize: '1 cup', calories: 149, protein: 8, carbs: 12, fat: 8, fiber: 0, category: 'dairy' },
    { name: 'Cheddar Cheese', servingSize: '1 oz', calories: 113, protein: 7, carbs: 0, fat: 9, fiber: 0, category: 'dairy' },
    { name: 'Cottage Cheese', servingSize: '1 cup', calories: 206, protein: 28, carbs: 8, fat: 9, fiber: 0, category: 'dairy' },
    // Snacks
    { name: 'Almonds', servingSize: '1 oz (23 nuts)', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 4, category: 'snack' },
    { name: 'Peanut Butter', servingSize: '2 tbsp', calories: 188, protein: 8, carbs: 6, fat: 16, fiber: 2, category: 'snack' },
    { name: 'Protein Bar', servingSize: '1 bar', calories: 210, protein: 20, carbs: 22, fat: 7, fiber: 3, category: 'snack' },
    { name: 'Trail Mix', servingSize: '1/4 cup', calories: 175, protein: 5, carbs: 15, fat: 12, fiber: 2, category: 'snack' },
    { name: 'Granola Bar', servingSize: '1 bar', calories: 140, protein: 3, carbs: 25, fat: 4, fiber: 2, category: 'snack' },
    // Drinks
    { name: 'Coffee (black)', servingSize: '1 cup', calories: 2, protein: 0, carbs: 0, fat: 0, fiber: 0, category: 'drink' },
    { name: 'Orange Juice', servingSize: '1 cup', calories: 112, protein: 2, carbs: 26, fat: 0, fiber: 0, category: 'drink' },
    { name: 'Chocolate Milk', servingSize: '1 cup', calories: 208, protein: 8, carbs: 26, fat: 8, fiber: 2, category: 'drink' },
    { name: 'Sports Drink (Gatorade)', servingSize: '20 oz', calories: 140, protein: 0, carbs: 36, fat: 0, fiber: 0, category: 'drink' },
    { name: 'Energy Drink', servingSize: '1 can', calories: 110, protein: 0, carbs: 28, fat: 0, fiber: 0, category: 'drink' },
    // Fast Food / Meals
    { name: 'Qdoba Burrito Bowl', brand: 'Qdoba', servingSize: '1 bowl', calories: 680, protein: 42, carbs: 62, fat: 24, fiber: 10, category: 'meal' },
    { name: 'Chicken Sandwich', brand: 'Chick-fil-A', servingSize: '1 sandwich', calories: 440, protein: 28, carbs: 40, fat: 19, fiber: 1, category: 'meal' },
    { name: 'Chicken Nuggets (12pc)', brand: 'Chick-fil-A', servingSize: '12 piece', calories: 380, protein: 40, carbs: 14, fat: 18, fiber: 0, category: 'meal' },
    { name: 'PB&J Sandwich', servingSize: '1 sandwich', calories: 376, protein: 13, carbs: 50, fat: 17, fiber: 4, category: 'meal' },
    { name: 'Chipotle Bowl', brand: 'Chipotle', servingSize: '1 bowl', calories: 720, protein: 46, carbs: 68, fat: 28, fiber: 12, category: 'meal' },
    { name: 'Subway 6-inch Turkey', brand: 'Subway', servingSize: '6 inch', calories: 280, protein: 18, carbs: 46, fat: 3, fiber: 5, category: 'meal' },
    { name: 'Pizza Slice (cheese)', servingSize: '1 large slice', calories: 285, protein: 12, carbs: 36, fat: 10, fiber: 2, category: 'meal' },
    { name: 'McChicken', brand: "McDonald's", servingSize: '1 sandwich', calories: 400, protein: 14, carbs: 40, fat: 21, fiber: 1, category: 'meal' },
  ];

  for (const food of foods) {
    await prisma.foodItem.upsert({
      where: { id: food.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') },
      update: food,
      create: { id: food.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'), ...food },
    });
  }
  console.log(`Seeded ${foods.length} food items`);

  // Seed Exercise Library
  const exercises = [
    { name: 'Bench Press', muscleGroup: 'Chest' },
    { name: 'Incline Bench Press', muscleGroup: 'Chest' },
    { name: 'Dumbbell Flys', muscleGroup: 'Chest' },
    { name: 'Push-ups', muscleGroup: 'Chest' },
    { name: 'Cable Crossover', muscleGroup: 'Chest' },
    { name: 'Pull-ups', muscleGroup: 'Back' },
    { name: 'Lat Pulldown', muscleGroup: 'Back' },
    { name: 'Barbell Row', muscleGroup: 'Back' },
    { name: 'Dumbbell Row', muscleGroup: 'Back' },
    { name: 'Deadlift', muscleGroup: 'Back' },
    { name: 'Cable Row', muscleGroup: 'Back' },
    { name: 'Overhead Press', muscleGroup: 'Shoulders' },
    { name: 'Lateral Raises', muscleGroup: 'Shoulders' },
    { name: 'Front Raises', muscleGroup: 'Shoulders' },
    { name: 'Face Pulls', muscleGroup: 'Shoulders' },
    { name: 'Bicep Curls', muscleGroup: 'Arms' },
    { name: 'Hammer Curls', muscleGroup: 'Arms' },
    { name: 'Tricep Pushdown', muscleGroup: 'Arms' },
    { name: 'Skull Crushers', muscleGroup: 'Arms' },
    { name: 'Tricep Dips', muscleGroup: 'Arms' },
    { name: 'Squat', muscleGroup: 'Legs' },
    { name: 'Leg Press', muscleGroup: 'Legs' },
    { name: 'Lunges', muscleGroup: 'Legs' },
    { name: 'Leg Extension', muscleGroup: 'Legs' },
    { name: 'Leg Curl', muscleGroup: 'Legs' },
    { name: 'Calf Raises', muscleGroup: 'Legs' },
    { name: 'Romanian Deadlift', muscleGroup: 'Legs' },
    { name: 'Plank', muscleGroup: 'Core' },
    { name: 'Crunches', muscleGroup: 'Core' },
    { name: 'Russian Twists', muscleGroup: 'Core' },
    { name: 'Leg Raises', muscleGroup: 'Core' },
    { name: 'Ab Wheel', muscleGroup: 'Core' },
    { name: 'Running', muscleGroup: 'Cardio' },
    { name: 'Cycling', muscleGroup: 'Cardio' },
    { name: 'Jump Rope', muscleGroup: 'Cardio' },
    { name: 'Rowing Machine', muscleGroup: 'Cardio' },
    { name: 'Stair Climber', muscleGroup: 'Cardio' },
    { name: 'Walking', muscleGroup: 'Cardio' },
  ];

  for (const exercise of exercises) {
    await prisma.exerciseLibrary.upsert({
      where: { name: exercise.name },
      update: exercise,
      create: exercise,
    });
  }
  console.log(`Seeded ${exercises.length} exercises`);

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
