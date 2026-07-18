import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Faculty from "@/models/Faculty";
import { getSessionFromRequest } from "@/lib/auth";

function requireAdmin(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  return null;
}

export async function PATCH(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const body = await request.json();
  const faculty = await Faculty.findByIdAndUpdate(params.id, body, { new: true });
  if (!faculty) return NextResponse.json({ error: "Faculty member not found." }, { status: 404 });
  return NextResponse.json({ ok: true, faculty });
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const deleted = await Faculty.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Faculty member not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Faculty member removed." });
}
