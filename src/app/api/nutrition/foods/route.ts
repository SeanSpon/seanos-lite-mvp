import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const USER_ID = 'sean-main';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q')?.trim() ?? '';

    const nameFilter = query
      ? { name: { contains: query, mode: 'insensitive' as const } }
      : {};

    const [foodItems, customFoods] = await Promise.all([
      prisma.foodItem.findMany({
        where: nameFilter,
        orderBy: { name: 'asc' },
        take: 100,
      }),
      prisma.customFood.findMany({
        where: {
          userId: USER_ID,
          ...nameFilter,
        },
        orderBy: { name: 'asc' },
        take: 50,
      }),
    ]);

    return NextResponse.json({
      foodItems,
      customFoods,
    });
  } catch (error) {
    console.error('Foods GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load food items' },
      { status: 500 }
    );
  }
}
