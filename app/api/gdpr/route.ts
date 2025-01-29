/** @format */

import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { checklist } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!checklist) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const complianceRecord = await prismadb.gDPRCompliance.create({
      data: {
        userId,
        dataConsent: checklist.dataConsent,
        dataProtection: checklist.dataProtection,
        dataRetention: checklist.dataRetention,
        dataAccess: checklist.dataAccess,
        dataBreach: checklist.dataBreach,
        createdAt: new Date()
      }
    });

    return NextResponse.json(complianceRecord);
  } catch (error) {
    console.error("[GDPR_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const complianceRecords = await prismadb.gDPRCompliance.findMany({
      where: {
        userId
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1
    });

    return NextResponse.json(complianceRecords[0] || null);
  } catch (error) {
    console.error("[GDPR_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
