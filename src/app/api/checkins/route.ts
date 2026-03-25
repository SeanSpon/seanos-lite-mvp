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

    const checkIn = await prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId: USER_ID, date } },
    });

    return NextResponse.json(checkIn);
  } catch (error) {
    console.error('Check-in GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load check-in' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { date, mood, energy, stress, sleepQuality } = body;

    if (!date || mood == null || energy == null || stress == null || sleepQuality == null) {
      return NextResponse.json(
        { error: 'Missing required fields: date, mood, energy, stress, sleepQuality' },
        { status: 400 }
      );
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    // Validate 1-5 ranges
    for (const [field, value] of Object.entries({ mood, energy, stress, sleepQuality })) {
      const num = Number(value);
      if (!Number.isInteger(num) || num < 1 || num > 5) {
        return NextResponse.json(
          { error: `${field} must be an integer between 1 and 5` },
          { status: 400 }
        );
      }
    }

    const checkIn = await prisma.dailyCheckIn.upsert({
      where: { userId_date: { userId: USER_ID, date } },
      update: {
        mood: Number(mood),
        energy: Number(energy),
        stress: Number(stress),
        sleepQuality: Number(sleepQuality),
        sleepHours: body.sleepHours != null ? Number(body.sleepHours) : undefined,
        weight: body.weight != null ? Number(body.weight) : undefined,
        steps: body.steps != null ? Number(body.steps) : undefined,
        waterGlasses: body.waterGlasses != null ? Number(body.waterGlasses) : undefined,
        quickNote: body.quickNote ?? undefined,
      },
      create: {
        userId: USER_ID,
        date,
        mood: Number(mood),
        energy: Number(energy),
        stress: Number(stress),
        sleepQuality: Number(sleepQuality),
        sleepHours: body.sleepHours != null ? Number(body.sleepHours) : null,
        weight: body.weight != null ? Number(body.weight) : null,
        steps: body.steps != null ? Number(body.steps) : null,
        waterGlasses: Number(body.waterGlasses ?? 0),
        quickNote: body.quickNote ?? null,
      },
    });

    return NextResponse.json(checkIn, { status: 201 });
  } catch (error) {
    console.error('Check-in POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save check-in' },
      { status: 500 }
    );
  }
}
