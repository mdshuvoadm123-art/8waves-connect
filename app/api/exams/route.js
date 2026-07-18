import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamSyllabus from "@/models/ExamSyllabus";
import { getSessionFromRequest } from "@/lib/auth";

export async function GET() {
  await connectDB();
  const exams = await ExamSyllabus.find({}).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ exams });
}

export async function POST(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }

  await connectDB();
  const body = await request.json();
  if (!body.title || !String(body.title).trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const exam = await ExamSyllabus.create(body);
  return NextResponse.json({ ok: true, exam }, { status: 201 });
}
