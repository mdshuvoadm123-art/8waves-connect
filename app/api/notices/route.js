import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
import { getSessionFromRequest } from "@/lib/auth";

// GET /api/notices -> everyone sees the current notices, newest first
export async function GET() {
  await connectDB();
  const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ notices });
}

// POST /api/notices -> admin only
export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  if (!body.message || !String(body.message).trim()) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const notice = await Notice.create(body);
  return NextResponse.json({ ok: true, notice }, { status: 201 });
}
