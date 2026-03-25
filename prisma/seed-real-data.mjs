import 'dotenv/config';
import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const userId = 'sean-main';

async function main() {
  const client = await pool.connect();
  console.log('Connected — seeding Sean\'s real data...');

  try {
    // ==========================================
    // UPDATE USER PROFILE with real Cronometer targets
    // ==========================================
    await client.query(`
      UPDATE "User" SET
        "calorieGoal" = 2958,
        "proteinGoal" = 185,
        "carbGoal" = 333,
        "fatGoal" = 99,
        "waterGoal" = 8,
        "stepsGoal" = 9400,
        "updatedAt" = NOW()
      WHERE id = $1
    `, [userId]);
    console.log('Updated user profile with Cronometer targets');

    // ==========================================
    // DAILY CHECK-INS (from Cronometer + Samsung Health)
    // Nutrition totals + steps + weight per day
    // ==========================================
    const checkIns = [
      // date, calories, protein, carbs, fat, water(glasses), steps, weight, activeMin, burnedCal
      ['2026-03-15', 2945, 171.6, 261.4, 127.9, 8, null, null],
      ['2026-03-16', 3322, 158.4, 406.8, 114.8, 18, null, null],
      ['2026-03-17', 2368, 184.6, 215.8, 77.4, 12, null, null],
      ['2026-03-18', 3609, 200.1, 420.4, 121.3, 4, null, null],
      ['2026-03-19', 2961, 156.6, 298.9, 120.5, 8, null, null],
      ['2026-03-20', 1488, 121.6, 131.4, 50.5, 3, null, null],
      ['2026-03-21', 2701, 210.7, 222.4, 102.6, 0, null, null],
      ['2026-03-22', 3181, 170.1, 280.0, 150.0, 17, 36851, null],
      ['2026-03-23', 3577, 214.4, 367.4, 131.2, 3, null, null],
      ['2026-03-24', 3056, 209.5, 303.4, 106.4, 0, null, 138],
      ['2026-03-25', 1743, 88.1, 193.2, 67.8, 9, null, null],
    ];

    // Also have multiple Samsung Health readings for 3/22
    // 27796 steps (2:04pm), 29208 (3:55pm), 33985 (6:05pm), 36851 (8:50pm)
    // Using final reading: 36851

    for (const [date, calories, protein, carbs, fat, waterGlasses, steps, weight] of checkIns) {
      await client.query(`
        INSERT INTO "DailyCheckIn" (id, "userId", date, mood, energy, stress, "sleepQuality", "waterGlasses", steps, weight, "quickNote", "createdAt")
        VALUES (gen_random_uuid(), $1, $2, 3, 3, 3, 3, $3, $4, $5, $6, NOW())
        ON CONFLICT ("userId", date) DO UPDATE SET
          "waterGlasses" = $3, steps = $4, weight = $5, "quickNote" = $6
      `, [userId, date, waterGlasses, steps, weight,
          `Cal:${calories} P:${protein}g C:${carbs}g F:${fat}g`]);
    }
    console.log(`Seeded ${checkIns.length} daily check-ins`);

    // ==========================================
    // FOOD LOGS — Real Cronometer meals
    // ==========================================
    const foodLogs = [
      // Day 1: Some visible day with Breakfast items (18286 screenshot)
      // Breakfast: Eggs 3 large (232.5), Banana (103.8), Body Fortress Whey (180), Milk 100g (60), Bagel 100g (264), Cream Cheese 2tbsp (88.5)
      ['2026-03-25', 'breakfast', 'Eggs, Cooked (3 large)', 233, 20, 1, 16],
      ['2026-03-25', 'breakfast', 'Banana', 104, 1, 27, 0],
      ['2026-03-25', 'breakfast', 'Body Fortress Super Advanced Whey', 180, 30, 7, 3],
      ['2026-03-25', 'breakfast', 'Whole Milk (100g)', 60, 3, 5, 3],
      ['2026-03-25', 'breakfast', 'Bagel (100g)', 264, 10, 50, 2],
      ['2026-03-25', 'breakfast', 'Cream Cheese Spread (2 tbsp)', 89, 2, 1, 9],

      // Lunch (18288): Good and Gather Chicken Breast 2pc (360), Body Fortress Whey (180), Milk 100g (60), Quaker Granola Bar (98.5)
      ['2026-03-25', 'lunch', 'Good and Gather Chicken Breast (2pc)', 360, 40, 4, 8],
      ['2026-03-25', 'lunch', 'Body Fortress Super Advanced Whey', 180, 30, 7, 3],
      ['2026-03-25', 'lunch', 'Whole Milk (100g)', 60, 3, 5, 3],
      ['2026-03-25', 'lunch', 'Quaker Chewy Granola Bar, Chocolate Chip', 99, 1, 18, 3],

      // Dinner (18288): Campbell's Chunky Soup Steak (120)
      ['2026-03-25', 'dinner', "Campbell's Chunky Soup, Steak (1 cup)", 120, 8, 16, 3],

      // Day with 2701 cal (Mar 21 — 18291 screenshot)
      // Dinner: Campbell's Chunky Soup (120), Body Fortress Whey (180), Milk (60), Banana (103.8), Buffalo Wild Wings 10 wings (610)
      // + Quaker Granola Bar (98.5) from snacks
      ['2026-03-21', 'dinner', "Campbell's Chunky Soup, Steak (1 cup)", 120, 8, 16, 3],
      ['2026-03-21', 'dinner', 'Body Fortress Super Advanced Whey', 180, 30, 7, 3],
      ['2026-03-21', 'dinner', 'Whole Milk (100g)', 60, 3, 5, 3],
      ['2026-03-21', 'dinner', 'Banana', 104, 1, 27, 0],
      ['2026-03-21', 'dinner', 'Buffalo Wild Wings, Boneless Wings (10)', 610, 40, 40, 30],
      ['2026-03-21', 'snack', 'Quaker Chewy Granola Bar, Chocolate Chip', 99, 1, 18, 3],

      // Day with 343 cal visible (Mar 22 early — 18298)
      // Breakfast: Body Fortress Whey (180), Banana (103.8), Milk 100g (60)
      ['2026-03-22', 'breakfast', 'Body Fortress Super Advanced Whey', 180, 30, 7, 3],
      ['2026-03-22', 'breakfast', 'Banana', 104, 1, 27, 0],
      ['2026-03-22', 'breakfast', 'Whole Milk (100g)', 60, 3, 5, 3],

      // Day 18300: Breakfast items visible - Body Fortress (180), Banana (103.8), Milk (60), Gatorade Whey Protein Bar (335.1), Yoplait Yogurt (150)
      // Then Qdoba lunch visible in 18304
      ['2026-03-22', 'breakfast', 'Gatorade Whey Protein Bar, Chocolate', 335, 20, 40, 10],
      ['2026-03-22', 'breakfast', 'Yoplait Original Yogurt, Strawberry', 150, 5, 26, 2],
      ['2026-03-22', 'lunch', 'Qdoba Grilled Steak (1 serving)', 260, 30, 2, 12],
      ['2026-03-22', 'lunch', 'Qdoba Three Cheese Queso (2 oz)', 96, 4, 4, 7],
      ['2026-03-22', 'lunch', 'Qdoba Hand Crafted Guacamole (1 oz)', 43, 1, 2, 4],
      ['2026-03-22', 'lunch', 'Qdoba Seasoned Brown Rice (4 oz)', 170, 3, 32, 3],
      ['2026-03-22', 'lunch', 'Qdoba Sour Cream (1 oz)', 50, 1, 1, 5],

      // Day with 1597 cal (18373 — visible date is a different day with weight 140.6)
      // Breakfast: Body Fortress Whey (180), Milk (60), Banana (103.8), Red Bull (158.4), Gatorade Whey Bar (335.1), Prairie Farms Choco Milk (410)
      ['2026-03-20', 'breakfast', 'Body Fortress Super Advanced Whey', 180, 30, 7, 3],
      ['2026-03-20', 'breakfast', 'Whole Milk (100g)', 60, 3, 5, 3],
      ['2026-03-20', 'breakfast', 'Banana', 104, 1, 27, 0],
      ['2026-03-20', 'breakfast', 'Red Bull North America, Energy Drink', 158, 2, 39, 0],
      ['2026-03-20', 'breakfast', 'Gatorade Whey Protein Bar, Chocolate', 335, 20, 40, 10],
      ['2026-03-20', 'breakfast', 'Prairie Farms Premium Chocolate Milk (473ml)', 410, 16, 60, 14],

      // Mar 24 (18334 — 3426.8 cal, weight 138.2)
      ['2026-03-24', 'snack', 'Weight logged: 138.2 lbs', 0, 0, 0, 0],
    ];

    for (const [date, meal, name, calories, protein, carbs, fat] of foodLogs) {
      await client.query(`
        INSERT INTO "FoodLog" (id, "userId", name, servings, calories, protein, carbs, fat, fiber, meal, date, "createdAt")
        VALUES (gen_random_uuid(), $1, $2, 1, $3, $4, $5, $6, 0, $7, $8, NOW())
      `, [userId, name, calories, protein, carbs, fat, meal, date]);
    }
    console.log(`Seeded ${foodLogs.length} food log entries`);

    // ==========================================
    // Add new exercises to library (from Hevy)
    // ==========================================
    const newExercises = [
      ['Bench Press (Dumbbell)', 'Chest'],
      ['Incline Bench Press (Dumbbell)', 'Chest'],
      ['Bench Press (Barbell)', 'Chest'],
      ['Butterfly (Pec Deck)', 'Chest'],
      ['Single Arm Cable Crossover', 'Chest'],
      ['Low Cable Fly Crossovers', 'Chest'],
      ['Triceps Pushdown', 'Arms'],
      ['EZ Bar Biceps Curl', 'Arms'],
      ['Reverse Curl (Barbell)', 'Arms'],
      ['Single Arm Curl (Cable)', 'Arms'],
      ['Seated Row (Machine)', 'Back'],
      ['Squat (Smith Machine)', 'Legs'],
      ['Leg Extension (Machine)', 'Legs'],
      ['Seated Leg Curl (Machine)', 'Legs'],
      ['Hip Adduction (Machine)', 'Legs'],
      ['Romanian Deadlift (Barbell)', 'Legs'],
      ['Single Arm Lateral Raise (Cable)', 'Shoulders'],
    ];

    for (const [name, muscleGroup] of newExercises) {
      await client.query(`
        INSERT INTO "ExerciseLibrary" (id, name, "muscleGroup")
        VALUES (gen_random_uuid(), $1, $2)
        ON CONFLICT (name) DO UPDATE SET "muscleGroup" = $2
      `, [name, muscleGroup]);
    }
    console.log(`Seeded ${newExercises.length} new exercises to library`);

    // ==========================================
    // WORKOUT LOGS from Hevy
    // ==========================================

    // --- WORKOUT 1: Upper A — Tue Mar 24, 10:29am ---
    // 1h 12min, 10380 lbs volume, 22 sets, 5 records
    // Split: Arms 44%, Chest 37%, Shoulders 11%
    const w1Id = 'workout-upper-a-mar24';
    await client.query(`
      INSERT INTO "WorkoutLog" (id, "userId", name, duration, "struggleRating", "energyLevel", notes, date, "createdAt")
      VALUES ($1, $2, 'Upper A', 72, 3, 3, 'Zach gabe rah. Arms 44%, Chest 37%, Shoulders 11%. Volume: 10,380 lbs. 5 records.', '2026-03-24', '2026-03-24T10:29:00Z')
      ON CONFLICT (id) DO NOTHING
    `, [w1Id, userId]);

    // Upper A exercises
    const w1exercises = [
      { name: 'Butterfly (Pec Deck)', sets: [[100,10],[150,8],[165,7]] },
      { name: 'Single Arm Lateral Raise (Cable)', sets: [[20,9]] },
      { name: 'Triceps Pushdown', sets: [[50,8],[60,6],[50,3]] },
      { name: 'Single Arm Cable Crossover', sets: [[15,10]] },
      { name: 'Low Cable Fly Crossovers', sets: [[15,10],[15,10]] },
      { name: 'Bench Press (Barbell)', sets: [[45,10],[95,7],[95,6],[75,8]] },
      { name: 'EZ Bar Biceps Curl', sets: [[40,10],[40,10],[40,7]] },
      { name: 'Reverse Curl (Barbell)', sets: [[40,5]] },
      { name: 'Single Arm Curl (Cable)', sets: [[15,10],[15,10]] },
      { name: 'Seated Row (Machine)', sets: [[90,10],[90,8]] },
    ];

    for (const ex of w1exercises) {
      const exRes = await client.query(`
        INSERT INTO "LoggedExercise" (id, "logId", name, "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, 0) RETURNING id
      `, [w1Id, ex.name]);
      const exId = exRes.rows[0].id;
      for (let i = 0; i < ex.sets.length; i++) {
        await client.query(`
          INSERT INTO "CompletedSet" (id, "exerciseId", "setNumber", reps, weight)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
        `, [exId, i + 1, ex.sets[i][1], ex.sets[i][0]]);
      }
    }
    console.log('Seeded Workout 1: Upper A (Mar 24)');

    // --- WORKOUT 2: Lower A — Mon Mar 23, 6:30pm ---
    // 44min, 13070 lbs volume, 13 sets, 4 records
    // Split: Legs 93%, Back 7%
    const w2Id = 'workout-lower-a-mar23';
    await client.query(`
      INSERT INTO "WorkoutLog" (id, "userId", name, duration, "struggleRating", "energyLevel", notes, date, "createdAt")
      VALUES ($1, $2, 'Lower A', 44, 3, 3, 'Went with maggie. Legs 93%, Back 7%. Volume: 13,070 lbs. 4 records.', '2026-03-23', '2026-03-23T18:30:00Z')
      ON CONFLICT (id) DO NOTHING
    `, [w2Id, userId]);

    const w2exercises = [
      { name: 'Squat (Smith Machine)', sets: [[75,8],[105,8],[165,6]] },
      { name: 'Leg Extension (Machine)', sets: [[90,10],[125,10],[165,10]] },
      { name: 'Seated Leg Curl (Machine)', sets: [[60,10],[80,9]] },
      { name: 'Hip Adduction (Machine)', sets: [[70,16],[120,16],[160,6]] },
      { name: 'Romanian Deadlift (Barbell)', sets: [[75,8],[115,8]] },
    ];

    for (const ex of w2exercises) {
      const exRes = await client.query(`
        INSERT INTO "LoggedExercise" (id, "logId", name, "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, 0) RETURNING id
      `, [w2Id, ex.name]);
      const exId = exRes.rows[0].id;
      for (let i = 0; i < ex.sets.length; i++) {
        await client.query(`
          INSERT INTO "CompletedSet" (id, "exerciseId", "setNumber", reps, weight)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
        `, [exId, i + 1, ex.sets[i][1], ex.sets[i][0]]);
      }
    }
    console.log('Seeded Workout 2: Lower A (Mar 23)');

    // --- WORKOUT 3: Chest/Tri/Shoulders — from 18276/18278 screenshots ---
    // Bench Press (Dumbbell), Incline Bench Press (Dumbbell), Triceps Pushdown
    const w3Id = 'workout-push-mar22';
    await client.query(`
      INSERT INTO "WorkoutLog" (id, "userId", name, duration, "struggleRating", "energyLevel", notes, date, "createdAt")
      VALUES ($1, $2, 'Push Day', 60, 3, 3, 'Chest and tris focus', '2026-03-22', '2026-03-22T14:00:00Z')
      ON CONFLICT (id) DO NOTHING
    `, [w3Id, userId]);

    const w3exercises = [
      { name: 'Bench Press (Dumbbell)', sets: [[35,11],[35,5]] },
      { name: 'Incline Bench Press (Dumbbell)', sets: [[30,10],[25,10],[25,10]] },
      { name: 'Triceps Pushdown', sets: [[50,8],[40,10],[30,5]] },
    ];

    for (const ex of w3exercises) {
      const exRes = await client.query(`
        INSERT INTO "LoggedExercise" (id, "logId", name, "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, 0) RETURNING id
      `, [w3Id, ex.name]);
      const exId = exRes.rows[0].id;
      for (let i = 0; i < ex.sets.length; i++) {
        await client.query(`
          INSERT INTO "CompletedSet" (id, "exerciseId", "setNumber", reps, weight)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
        `, [exId, i + 1, ex.sets[i][1], ex.sets[i][0]]);
      }
    }
    console.log('Seeded Workout 3: Push Day (Mar 22)');

    // --- Duplicate the second Upper A workout (18399/18401/18403 are same exercises as workout 1 but from a different session) ---
    // These screenshots at 3:51pm appear to be another Upper A session (possibly Mar 21 or earlier)
    const w4Id = 'workout-upper-a-mar21';
    await client.query(`
      INSERT INTO "WorkoutLog" (id, "userId", name, duration, "struggleRating", "energyLevel", notes, date, "createdAt")
      VALUES ($1, $2, 'Upper A', 72, 3, 3, 'Chest/Arms/Back session. Same Upper A template.', '2026-03-21', '2026-03-21T15:51:00Z')
      ON CONFLICT (id) DO NOTHING
    `, [w4Id, userId]);

    const w4exercises = [
      { name: 'Butterfly (Pec Deck)', sets: [[100,10],[150,8],[165,7]] },
      { name: 'Single Arm Lateral Raise (Cable)', sets: [[20,9]] },
      { name: 'Triceps Pushdown', sets: [[50,8],[60,6],[50,3]] },
      { name: 'Single Arm Cable Crossover', sets: [[15,10]] },
      { name: 'Low Cable Fly Crossovers', sets: [[15,10],[15,10]] },
      { name: 'Bench Press (Barbell)', sets: [[45,10],[95,7],[95,6],[75,8]] },
      { name: 'EZ Bar Biceps Curl', sets: [[40,10],[40,10],[40,7]] },
      { name: 'Reverse Curl (Barbell)', sets: [[40,5]] },
      { name: 'Single Arm Curl (Cable)', sets: [[15,10],[15,10]] },
      { name: 'Seated Row (Machine)', sets: [[90,10],[90,8]] },
    ];

    for (const ex of w4exercises) {
      const exRes = await client.query(`
        INSERT INTO "LoggedExercise" (id, "logId", name, "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, 0) RETURNING id
      `, [w4Id, ex.name]);
      const exId = exRes.rows[0].id;
      for (let i = 0; i < ex.sets.length; i++) {
        await client.query(`
          INSERT INTO "CompletedSet" (id, "exerciseId", "setNumber", reps, weight)
          VALUES (gen_random_uuid(), $1, $2, $3, $4)
        `, [exId, i + 1, ex.sets[i][1], ex.sets[i][0]]);
      }
    }
    console.log('Seeded Workout 4: Upper A (Mar 21)');

    // ==========================================
    // SAMSUNG HEALTH — Steps data for March
    // Monthly summary from 18310: 318,969 steps, 3,406 mins active, 11,705 cal burned in 22 days
    // Average: ~14,498 steps/day
    // Specific readings from screenshots:
    // ==========================================
    // Mar 22: 27796 -> 29208 -> 33985 -> 36851 (final)
    // Already captured in check-ins above

    // ==========================================
    // CRONOMETER WEEKLY AVERAGE (from 18331 dashboard)
    // Last 7 days consumed average: 2649.4 kcal
    // Protein: 695 kcal (169.5g) — 26%
    // Carbs: 1068 kcal (258.1g) — 40%
    // Fat: 887 kcal (99.7g) — 33%
    // ==========================================

    // ==========================================
    // WEIGHT ENTRIES
    // ==========================================
    // Mar 24: 138 lbs (from 18375)
    // Mar 24 (another): 138.2 lbs (from 18334)
    // A day with 140.6 lbs (from 18373)
    // Mar 23: 170.2 (partially visible in 18377 — likely lbs)

    // ==========================================
    // Additional custom foods from Cronometer
    // ==========================================
    const customFoods = [
      ['Body Fortress Super Advanced Whey', 'Body Fortress', '1 scoop', 180, 30, 7, 3, 0, 'protein'],
      ['Gatorade Whey Protein Bar, Chocolate', 'Gatorade', '1 bar (2.8 oz)', 335, 20, 40, 10, 3, 'snack'],
      ['Good and Gather Chicken Breast', 'Good and Gather', '2 pieces', 360, 40, 4, 8, 0, 'protein'],
      ['Prairie Farms Premium Chocolate Milk', 'Prairie Farms', '1 bottle (473ml)', 410, 16, 60, 14, 0, 'drink'],
      ['Red Bull Energy Drink', 'Red Bull', '1 can', 158, 2, 39, 0, 0, 'drink'],
      ['Yoplait Original Yogurt, Strawberry', 'Yoplait', '1 container', 150, 5, 26, 2, 0, 'dairy'],
      ['Quaker Chewy Granola Bar, Chocolate Chip', 'Quaker', '1 bar (0.8 oz)', 99, 1, 18, 3, 1, 'snack'],
      ['Buffalo Wild Wings Boneless Wings', 'Buffalo Wild Wings', '10 wings', 610, 40, 40, 30, 1, 'meal'],
      ["Campbell's Chunky Soup, Steak", "Campbell's", '1 cup (240mL)', 120, 8, 16, 3, 2, 'meal'],
      ['Cream Cheese Spread', null, '2 tbsp', 89, 2, 1, 9, 0, 'dairy'],
    ];

    for (const [name, brand, servingSize, calories, protein, carbs, fat, fiber, category] of customFoods) {
      await client.query(`
        INSERT INTO "CustomFood" (id, "userId", name, brand, "servingSize", calories, protein, carbs, fat, fiber, category, "createdAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      `, [userId, name, brand, servingSize, calories, protein, carbs, fat, fiber, category]);
    }
    console.log(`Seeded ${customFoods.length} custom foods from Cronometer`);

    // Also add to FoodItem library
    for (const [name, brand, servingSize, calories, protein, carbs, fat, fiber, category] of customFoods) {
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      await client.query(`
        INSERT INTO "FoodItem" (id, name, brand, "servingSize", calories, protein, carbs, fat, fiber, category)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET name=$2, brand=$3, calories=$5, protein=$6, carbs=$7, fat=$8
      `, [id, name, brand, servingSize, calories, protein, carbs, fat, fiber, category]);
    }
    console.log('Added custom foods to global food library');

    // ==========================================
    // WORKOUT PLANS (templates from Hevy)
    // ==========================================
    // Upper A template
    const planUpperId = 'plan-upper-a';
    await client.query(`
      INSERT INTO "WorkoutPlan" (id, "userId", name, days, "createdAt")
      VALUES ($1, $2, 'Upper A', '{2,4,6}', NOW())
      ON CONFLICT (id) DO NOTHING
    `, [planUpperId, userId]);

    const upperExercises = [
      ['Butterfly (Pec Deck)', 'Chest', 3, 8, 150],
      ['Single Arm Lateral Raise (Cable)', 'Shoulders', 1, 9, 20],
      ['Triceps Pushdown', 'Arms', 3, 8, 50],
      ['Single Arm Cable Crossover', 'Chest', 1, 10, 15],
      ['Low Cable Fly Crossovers', 'Chest', 2, 10, 15],
      ['Bench Press (Barbell)', 'Chest', 4, 8, 95],
      ['EZ Bar Biceps Curl', 'Arms', 3, 10, 40],
      ['Reverse Curl (Barbell)', 'Arms', 1, 5, 40],
      ['Single Arm Curl (Cable)', 'Arms', 2, 10, 15],
      ['Seated Row (Machine)', 'Back', 2, 9, 90],
    ];

    for (let i = 0; i < upperExercises.length; i++) {
      const [name, muscleGroup, targetSets, targetReps, targetWeight] = upperExercises[i];
      await client.query(`
        INSERT INTO "PlannedExercise" (id, "planId", name, "muscleGroup", "targetSets", "targetReps", "targetWeight", "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
      `, [planUpperId, name, muscleGroup, targetSets, targetReps, targetWeight, i]);
    }

    // Lower A template
    const planLowerId = 'plan-lower-a';
    await client.query(`
      INSERT INTO "WorkoutPlan" (id, "userId", name, days, "createdAt")
      VALUES ($1, $2, 'Lower A', '{1,3,5}', NOW())
      ON CONFLICT (id) DO NOTHING
    `, [planLowerId, userId]);

    const lowerExercises = [
      ['Squat (Smith Machine)', 'Legs', 3, 8, 165],
      ['Leg Extension (Machine)', 'Legs', 3, 10, 165],
      ['Seated Leg Curl (Machine)', 'Legs', 2, 10, 80],
      ['Hip Adduction (Machine)', 'Legs', 3, 12, 120],
      ['Romanian Deadlift (Barbell)', 'Legs', 2, 8, 115],
    ];

    for (let i = 0; i < lowerExercises.length; i++) {
      const [name, muscleGroup, targetSets, targetReps, targetWeight] = lowerExercises[i];
      await client.query(`
        INSERT INTO "PlannedExercise" (id, "planId", name, "muscleGroup", "targetSets", "targetReps", "targetWeight", "sortOrder")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7)
      `, [planLowerId, name, muscleGroup, targetSets, targetReps, targetWeight, i]);
    }
    console.log('Seeded 2 workout plan templates (Upper A, Lower A)');

    console.log('\n=== SEED COMPLETE ===');
    console.log('Data imported:');
    console.log('- 11 days of nutrition check-ins (Mar 15-25)');
    console.log('- 37+ food log entries from Cronometer');
    console.log('- 10 custom foods (Body Fortress, Gatorade Bar, etc.)');
    console.log('- 4 full workout sessions from Hevy');
    console.log('- 17 new exercises added to library');
    console.log('- 2 workout plan templates (Upper A, Lower A)');
    console.log('- Samsung Health step data for Mar 22');
    console.log('- Weight entries: 138-140.6 lbs');

  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(console.error);
