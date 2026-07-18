import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/Material";
import { getSessionFromRequest } from "@/lib/auth";

// GET /api/materials -> everyone can see the category list (name + link)
export async function GET() {
  await connectDB();
  const materials = await Material.find({}).sort({ order: 1, name: 1 }).lean();
  return NextResponse.json({ materials });
}

// POST /api/materials -> admin only, adds a new category (e.g. "1-1", "Software")
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
  if (!body.driveLink || !String(body.driveLink).trim()) {
    return NextResponse.json({ error: "A Drive link is required." }, { status: 400 });
  }

  const material = await Material.create(body);
  return NextResponse.json({ ok: true, material }, { status: 201 });
}
