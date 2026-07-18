import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
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
  const notice = await Notice.findByIdAndUpdate(params.id, body, { new: true });
  if (!notice) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, notice });
}

export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const deleted = await Notice.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Notice removed." });
}
