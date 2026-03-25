import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 'sean-main';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const [user, foodLogs, checkIn, workoutLogs] = await Promise.all([
      // User profile with goals and RPG stats
      prisma.user.findUnique({
        where: { id: USER_ID },
        select: {
          id: true,
          name: true,
          level: true,
          xp: true,
          totalXp: true,
          bodyScore: true,
          streakDays: true,
          longestStreak: true,
          statStrength: true,
          statEndurance: true,
          statDiscipline: true,
          statNutrition: true,
          statRecovery: true,
          statMind: true,
          calorieGoal: true,
          proteinGoal: true,
          carbGoal: true,
          fatGoal: true,
          fiberGoal: true,
          waterGoal: true,
          stepsGoal: true,
        },
      }),

      // Today's food logs for nutrition totals
      prisma.foodLog.findMany({
        where: { userId: USER_ID, date: today },
      }),

      // Today's check-in
      prisma.dailyCheckIn.findUnique({
        where: { userId_date: { userId: USER_ID, date: today } },
      }),

      // Workouts from the last 7 days
      prisma.workoutLog.findMany({
        where: {
          userId: USER_ID,
          date: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split('T')[0],
          },
        },
        orderBy: { date: 'desc' },
        select: {
          id: true,
          name: true,
          duration: true,
          date: true,
          struggleRating: true,
          energyLevel: true,
        },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const nutritionTotals = foodLogs.reduce(
      (acc, log) => ({
        calories: acc.calories + log.calories,
        protein: acc.protein + log.protein,
        carbs: acc.carbs + log.carbs,
        fat: acc.fat + log.fat,
        fiber: acc.fiber + log.fiber,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return NextResponse.json({
      user,
      nutrition: nutritionTotals,
      checkIn,
      workouts: {
        count: workoutLogs.length,
        lastWorkout: workoutLogs[0] ?? null,
      },
      today,
    });
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load dashboard' },
      { status: 500 }
    );
  }
}
