import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET(request: Request) {
  try {
    // Total number of users
    const totalUsers = await prisma.user.count();

    // Number of active users (users who have logged in within the last 30 days)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(new Date().setDate(new Date().getDate() - 30)),
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      activeUsers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error retrieving analytics data' },
      { status: 500 }
    );
  }
}
