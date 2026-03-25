import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 'sean-main';

export async function GET() {
  try {
    const plans = await prisma.workoutPlan.findMany({
      where: { userId: USER_ID },
      orderBy: { createdAt: 'desc' },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Workout plans GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load workout plans' },
      { status: 500 }
    );
  }
}
