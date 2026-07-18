import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Student from "@/models/Student";
import { getSessionFromRequest } from "@/lib/auth";

const PUBLIC_FIELDS =
  "name rollNumber session email phone bloodGroup hometown bio photoUrl socialLink status createdAt updatedAt";

// GET /api/students            -> approved profiles only (public directory)
// GET /api/students?all=1      -> every profile with every status (admin dashboard, requires session)
export async function GET(request) {
  await connectDB();
  const { searchParams } = new URL(request.url);
  const wantsAll = searchParams.get("all") === "1";
  const session = getSessionFromRequest(request);

  if (wantsAll && session) {
    const students = await Student.find({}).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ students });
  }

  const students = await Student.find({ status: "approved" })
    .select(PUBLIC_FIELDS)
    .sort({ name: 1 })
    .lean();
  return NextResponse.json({ students });
}

// POST /api/students -> anyone can submit a new profile or an edit request.
// It is ALWAYS created with status "pending" and never shown publicly
// until an admin approves it.
export async function POST(request) {
  await connectDB();
  const body = await request.json();

  const {
    name,
    rollNumber,
    session: classSession,
    email,
    phone,
    bloodGroup,
    hometown,
    bio,
    photoUrl,
    socialLink,
    submittedBy,
    replacesId,
  } = body;

  if (!name || !String(name).trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }

  if (replacesId) {
    const target = await Student.findOne({ _id: replacesId, status: "approved" });
    if (!target) {
      return NextResponse.json(
        { error: "The profile you're trying to update could not be found." },
        { status: 404 }
      );
    }
  }

  const submission = await Student.create({
    name,
    rollNumber,
    session: classSession,
    email,
    phone,
    bloodGroup,
    hometown,
    bio,
    photoUrl,
    socialLink,
    submittedBy,
    replacesId: replacesId || null,
    status: "pending",
  });

  return NextResponse.json(
    {
      ok: true,
      message:
        "Thanks! Your details were sent to the OSTOTORONGO admin queue and will appear once approved.",
      id: submission._id,
    },
    { status: 201 }
  );
}
