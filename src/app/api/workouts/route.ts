import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 'sean-main';

export async function GET() {
  try {
    const workoutLogs = await prisma.workoutLog.findMany({
      where: { userId: USER_ID },
      orderBy: { date: 'desc' },
      take: 10,
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
    });

    return NextResponse.json(workoutLogs);
  } catch (error) {
    console.error('Workouts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load workouts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, duration, exercises, date } = body;

    if (!name || duration == null || !exercises || !Array.isArray(exercises) || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: name, duration, exercises, date' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const workoutLog = await prisma.workoutLog.create({
      data: {
        userId: USER_ID,
        name,
        duration: Number(duration),
        date,
        struggleRating: Number(body.struggleRating ?? 3),
        energyLevel: Number(body.energyLevel ?? 3),
        notes: body.notes ?? null,
        mood: body.mood ?? null,
        planId: body.planId ?? null,
        exercises: {
          create: exercises.map(
            (
              exercise: { name: string; sets: { reps: number; weight: number; rpe?: number }[]; notes?: string },
              exerciseIndex: number
            ) => ({
              name: exercise.name,
              notes: exercise.notes ?? null,
              sortOrder: exerciseIndex,
              sets: {
                create: (exercise.sets ?? []).map(
                  (
                    set: { reps: number; weight: number; rpe?: number },
                    setIndex: number
                  ) => ({
                    setNumber: setIndex + 1,
                    reps: Number(set.reps),
                    weight: Number(set.weight),
                    rpe: set.rpe != null ? Number(set.rpe) : null,
                  })
                ),
              },
            })
          ),
        },
      },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    });

    return NextResponse.json(workoutLog, { status: 201 });
  } catch (error) {
    console.error('Workouts POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}
