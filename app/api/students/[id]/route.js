import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getSessionFromRequest } from "@/lib/auth";

function requireAdmin(request) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Admin sign-in required." }, { status: 401 });
  }
  return null;
}

const EDITABLE_FIELDS = [
  "name",
  "rollNumber",
  "session",
  "email",
  "phone",
  "bloodGroup",
  "hometown",
  "bio",
  "photoUrl",
  "socialLink",
];

// PATCH /api/students/:id  body: { action: "approve" | "reject" | "edit", reviewNote?, data? }
export async function PATCH(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const { id } = params;
  const body = await request.json();
  const doc = await Student.findById(id);
  if (!doc) return NextResponse.json({ error: "Profile not found." }, { status: 404 });

  if (body.action === "approve") {
    if (doc.replacesId) {
      // This was an edit request for an existing approved profile.
      // Copy the submitted fields onto the original and discard the request doc.
      const target = await Student.findById(doc.replacesId);
      if (!target) {
        return NextResponse.json(
          { error: "Original profile no longer exists." },
          { status: 404 }
        );
      }
      for (const field of EDITABLE_FIELDS) {
        if (doc[field] !== undefined) target[field] = doc[field];
      }
      target.status = "approved";
      await target.save();
      await Student.findByIdAndDelete(doc._id);
      return NextResponse.json({ ok: true, message: "Update approved and applied.", id: target._id });
    }

    doc.status = "approved";
    doc.reviewNote = "";
    await doc.save();
    return NextResponse.json({ ok: true, message: "Profile approved.", id: doc._id });
  }

  if (body.action === "reject") {
    doc.status = "rejected";
    doc.reviewNote = body.reviewNote || "";
    await doc.save();
    return NextResponse.json({ ok: true, message: "Profile rejected.", id: doc._id });
  }

  if (body.action === "edit" && body.data) {
    for (const field of EDITABLE_FIELDS) {
      if (body.data[field] !== undefined) doc[field] = body.data[field];
    }
    await doc.save();
    return NextResponse.json({ ok: true, message: "Profile updated.", id: doc._id });
  }

  return NextResponse.json({ error: "Unknown or missing action." }, { status: 400 });
}

// DELETE /api/students/:id
export async function DELETE(request, { params }) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  await connectDB();
  const deleted = await Student.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  return NextResponse.json({ ok: true, message: "Profile deleted." });
}
