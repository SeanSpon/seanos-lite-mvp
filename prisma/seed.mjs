import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  console.log('Connected to Neon database');

  try {
    // Create default user
    const userResult = await client.query(`
      INSERT INTO "User" (id, name, email, "calorieGoal", "proteinGoal", "carbGoal", "fatGoal", "fiberGoal", "waterGoal", "stepsGoal", theme, "accentColor", level, xp, "totalXp", "bodyScore", "streakDays", "longestStreak", "statStrength", "statEndurance", "statDiscipline", "statNutrition", "statRecovery", "statMind", "createdAt", "updatedAt")
      VALUES ('sean-main', 'Sean', 'sean@seanos.app', 3000, 160, 375, 80, 30, 8, 10000, 'dark', '#06b6d4', 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET name = 'Sean'
      RETURNING id, name
    `);
    console.log('User:', userResult.rows[0]);

    // Seed Food Database
    const foods = [
      ['chicken-breast', 'Chicken Breast (grilled)', null, '4 oz', 187, 35, 0, 4, 0, 'protein'],
      ['ground-beef-90', 'Ground Beef 90/10', null, '4 oz', 200, 22, 0, 11, 0, 'protein'],
      ['salmon', 'Salmon Fillet', null, '4 oz', 234, 25, 0, 14, 0, 'protein'],
      ['eggs', 'Eggs (whole)', null, '2 large', 143, 13, 1, 10, 0, 'protein'],
      ['egg-whites', 'Egg Whites', null, '4 large', 68, 14, 1, 0, 0, 'protein'],
      ['turkey-breast', 'Turkey Breast (sliced)', null, '4 oz', 120, 26, 0, 1, 0, 'protein'],
      ['tuna-canned', 'Tuna (canned in water)', null, '1 can', 120, 27, 0, 1, 0, 'protein'],
      ['shrimp', 'Shrimp', null, '4 oz', 120, 23, 1, 2, 0, 'protein'],
      ['sirloin-steak', 'Sirloin Steak', null, '6 oz', 320, 44, 0, 15, 0, 'protein'],
      ['protein-shake', 'Whey Protein Shake', null, '1 scoop + water', 120, 24, 3, 1, 0, 'protein'],
      ['white-rice', 'White Rice (cooked)', null, '1 cup', 206, 4, 45, 0, 1, 'grain'],
      ['brown-rice', 'Brown Rice (cooked)', null, '1 cup', 216, 5, 45, 2, 4, 'grain'],
      ['oatmeal', 'Oatmeal', null, '1 cup cooked', 154, 5, 27, 3, 4, 'grain'],
      ['wheat-bread', 'Whole Wheat Bread', null, '2 slices', 160, 8, 28, 2, 4, 'grain'],
      ['pasta', 'Pasta (cooked)', null, '1 cup', 220, 8, 43, 1, 3, 'grain'],
      ['tortilla', 'Flour Tortilla (large)', null, '1 tortilla', 210, 5, 36, 5, 2, 'grain'],
      ['cereal', 'Cereal (generic)', null, '1 cup', 150, 3, 34, 1, 3, 'grain'],
      ['bagel', 'Bagel (plain)', null, '1 bagel', 270, 10, 53, 2, 2, 'grain'],
      ['banana', 'Banana', null, '1 medium', 105, 1, 27, 0, 3, 'fruit'],
      ['apple', 'Apple', null, '1 medium', 95, 0, 25, 0, 4, 'fruit'],
      ['blueberries', 'Blueberries', null, '1 cup', 85, 1, 21, 0, 4, 'fruit'],
      ['strawberries', 'Strawberries', null, '1 cup', 49, 1, 12, 0, 3, 'fruit'],
      ['orange', 'Orange', null, '1 medium', 62, 1, 15, 0, 3, 'fruit'],
      ['broccoli', 'Broccoli', null, '1 cup', 55, 4, 11, 0, 5, 'vegetable'],
      ['spinach', 'Spinach (raw)', null, '2 cups', 14, 2, 2, 0, 1, 'vegetable'],
      ['sweet-potato', 'Sweet Potato', null, '1 medium', 103, 2, 24, 0, 4, 'vegetable'],
      ['mixed-veggies', 'Mixed Vegetables', null, '1 cup', 80, 4, 15, 0, 5, 'vegetable'],
      ['greek-yogurt', 'Greek Yogurt (plain)', null, '1 cup', 130, 22, 8, 0, 0, 'dairy'],
      ['whole-milk', 'Whole Milk', null, '1 cup', 149, 8, 12, 8, 0, 'dairy'],
      ['cheddar-cheese', 'Cheddar Cheese', null, '1 oz', 113, 7, 0, 9, 0, 'dairy'],
      ['cottage-cheese', 'Cottage Cheese', null, '1 cup', 206, 28, 8, 9, 0, 'dairy'],
      ['almonds', 'Almonds', null, '1 oz (23 nuts)', 164, 6, 6, 14, 4, 'snack'],
      ['peanut-butter', 'Peanut Butter', null, '2 tbsp', 188, 8, 6, 16, 2, 'snack'],
      ['protein-bar', 'Protein Bar', null, '1 bar', 210, 20, 22, 7, 3, 'snack'],
      ['trail-mix', 'Trail Mix', null, '1/4 cup', 175, 5, 15, 12, 2, 'snack'],
      ['granola-bar', 'Granola Bar', null, '1 bar', 140, 3, 25, 4, 2, 'snack'],
      ['coffee-black', 'Coffee (black)', null, '1 cup', 2, 0, 0, 0, 0, 'drink'],
      ['orange-juice', 'Orange Juice', null, '1 cup', 112, 2, 26, 0, 0, 'drink'],
      ['chocolate-milk', 'Chocolate Milk', null, '1 cup', 208, 8, 26, 8, 2, 'drink'],
      ['sports-drink', 'Sports Drink (Gatorade)', null, '20 oz', 140, 0, 36, 0, 0, 'drink'],
      ['energy-drink', 'Energy Drink', null, '1 can', 110, 0, 28, 0, 0, 'drink'],
      ['qdoba-bowl', 'Qdoba Burrito Bowl', 'Qdoba', '1 bowl', 680, 42, 62, 24, 10, 'meal'],
      ['cfa-sandwich', 'Chicken Sandwich', 'Chick-fil-A', '1 sandwich', 440, 28, 40, 19, 1, 'meal'],
      ['cfa-nuggets', 'Chicken Nuggets (12pc)', 'Chick-fil-A', '12 piece', 380, 40, 14, 18, 0, 'meal'],
      ['pbj', 'PB&J Sandwich', null, '1 sandwich', 376, 13, 50, 17, 4, 'meal'],
      ['chipotle-bowl', 'Chipotle Bowl', 'Chipotle', '1 bowl', 720, 46, 68, 28, 12, 'meal'],
      ['subway-turkey', 'Subway 6-inch Turkey', 'Subway', '6 inch', 280, 18, 46, 3, 5, 'meal'],
      ['pizza-slice', 'Pizza Slice (cheese)', null, '1 large slice', 285, 12, 36, 10, 2, 'meal'],
      ['mcchicken', 'McChicken', "McDonald's", '1 sandwich', 400, 14, 40, 21, 1, 'meal'],
    ];

    for (const [id, name, brand, servingSize, calories, protein, carbs, fat, fiber, category] of foods) {
      await client.query(`
        INSERT INTO "FoodItem" (id, name, brand, "servingSize", calories, protein, carbs, fat, fiber, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET name=$2, brand=$3, "servingSize"=$4, calories=$5, protein=$6, carbs=$7, fat=$8, fiber=$9, category=$10
      `, [id, name, brand, servingSize, calories, protein, carbs, fat, fiber, category]);
    }
    console.log(`Seeded ${foods.length} food items`);

    // Seed Exercise Library
    const exercises = [
      ['Bench Press', 'Chest'], ['Incline Bench Press', 'Chest'], ['Dumbbell Flys', 'Chest'],
      ['Push-ups', 'Chest'], ['Cable Crossover', 'Chest'],
      ['Pull-ups', 'Back'], ['Lat Pulldown', 'Back'], ['Barbell Row', 'Back'],
      ['Dumbbell Row', 'Back'], ['Deadlift', 'Back'], ['Cable Row', 'Back'],
      ['Overhead Press', 'Shoulders'], ['Lateral Raises', 'Shoulders'],
      ['Front Raises', 'Shoulders'], ['Face Pulls', 'Shoulders'],
      ['Bicep Curls', 'Arms'], ['Hammer Curls', 'Arms'], ['Tricep Pushdown', 'Arms'],
      ['Skull Crushers', 'Arms'], ['Tricep Dips', 'Arms'],
      ['Squat', 'Legs'], ['Leg Press', 'Legs'], ['Lunges', 'Legs'],
      ['Leg Extension', 'Legs'], ['Leg Curl', 'Legs'], ['Calf Raises', 'Legs'],
      ['Romanian Deadlift', 'Legs'],
      ['Plank', 'Core'], ['Crunches', 'Core'], ['Russian Twists', 'Core'],
      ['Leg Raises', 'Core'], ['Ab Wheel', 'Core'],
      ['Running', 'Cardio'], ['Cycling', 'Cardio'], ['Jump Rope', 'Cardio'],
      ['Rowing Machine', 'Cardio'], ['Stair Climber', 'Cardio'], ['Walking', 'Cardio'],
    ];

    for (const [name, muscleGroup] of exercises) {
      await client.query(`
        INSERT INTO "ExerciseLibrary" (id, name, "muscleGroup")
        VALUES (gen_random_uuid(), $1, $2)
        ON CONFLICT (name) DO UPDATE SET "muscleGroup"=$2
      `, [name, muscleGroup]);
    }
    console.log(`Seeded ${exercises.length} exercises`);

    console.log('Seed complete!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
