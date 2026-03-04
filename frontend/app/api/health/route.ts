import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "healthy",
        service: "ai-springer-frontend",
        timestamp: new Date().toISOString(),
    });
}
