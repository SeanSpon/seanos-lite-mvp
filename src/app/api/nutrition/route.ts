import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 'sean-main';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const date = searchParams.get('date');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Missing or invalid date param (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const [foodLogs, user] = await Promise.all([
      prisma.foodLog.findMany({
        where: { userId: USER_ID, date },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.user.findUnique({
        where: { id: USER_ID },
        select: {
          calorieGoal: true,
          proteinGoal: true,
          carbGoal: true,
          fatGoal: true,
          fiberGoal: true,
        },
      }),
    ]);

    const meals: Record<string, typeof foodLogs> = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
    };

    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    for (const log of foodLogs) {
      const bucket = meals[log.meal] ?? meals.snack;
      bucket.push(log);
      totals.calories += log.calories;
      totals.protein += log.protein;
      totals.carbs += log.carbs;
      totals.fat += log.fat;
      totals.fiber += log.fiber;
    }

    return NextResponse.json({
      date,
      meals,
      totals,
      goals: user ?? null,
    });
  } catch (error) {
    console.error('Nutrition GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load nutrition data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, calories, protein, carbs, fat, meal, date } = body;

    if (!name || calories == null || protein == null || carbs == null || fat == null || !meal || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, calories, protein, carbs, fat, meal, date' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const validMeals = ['breakfast', 'lunch', 'dinner', 'snack'];
    if (!validMeals.includes(meal)) {
      return NextResponse.json(
        { error: `Invalid meal type. Must be one of: ${validMeals.join(', ')}` },
        { status: 400 }
      );
    }

    const foodLog = await prisma.foodLog.create({
      data: {
        userId: USER_ID,
        name,
        calories: Math.round(Number(calories)),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
        fiber: Number(body.fiber ?? 0),
        meal,
        date,
        servings: Number(body.servings ?? 1),
        foodItemId: body.foodItemId ?? null,
      },
    });

    return NextResponse.json(foodLog, { status: 201 });
  } catch (error) {
    console.error('Nutrition POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create food log' },
      { status: 500 }
    );
  }
}
