import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Faculty from "@/models/Faculty";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  await connectDB();
  const faculty = await Faculty.find({}).sort({ order: 1, name: 1 }).lean();
  return NextResponse.json({ faculty });
}

// POST /api/faculty -> admin only, this is the ONLY way faculty entries are created
export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  const faculty = await Faculty.create(body);
  return NextResponse.json({ ok: true, faculty }, { status: 201 });
}
