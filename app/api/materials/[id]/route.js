import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Material from "@/models/Material";
import { getSessionFromRequest } from "@/lib/auth";

function requireAdmin(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  return null;
}

// PATCH /api/materials/:id -> admin only, edit a category's name/link/order
export async function PATCH(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const body = await request.json();
  const material = await Material.findByIdAndUpdate(params.id, body, { new: true });
  if (!material) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, material });
}

// DELETE /api/materials/:id -> admin only
export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const deleted = await Material.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Category removed." });
}
