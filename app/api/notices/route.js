import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Notice from "@/models/Notice";
import Student from "@/models/Student";
import { getSessionFromRequest } from "@/lib/auth";
import { sendBulkEmail } from "@/lib/email";

// GET /api/notices -> everyone sees the current notices, newest first
export async function GET() {
  await connectDB();
  const notices = await Notice.find({}).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ notices });
}

// POST /api/notices -> admin only. Also emails every approved classmate
// who has an email on file, best-effort (a failed email never blocks the
// notice itself from being saved).
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

  let emailResult = { sent: 0, error: null };
  try {
    const students = await Student.find({ status: "approved", email: { $ne: "" } })
      .select("email")
      .lean();
    const recipients = students.map((s) => s.email).filter(Boolean);
    const result = await sendBulkEmail({
      recipients,
      subject: "8WAVES CONNECT — New notice",
      text: body.message,
      html: `<div style="font-family:sans-serif;font-size:15px;color:#111;">
        <p style="font-size:12px;letter-spacing:0.08em;color:#ff6b4a;font-weight:700;">NOTICE</p>
        <p>${String(body.message).replace(/</g, "&lt;")}</p>
        <p style="font-size:12px;color:#888;margin-top:24px;">— 8WAVES CONNECT</p>
      </div>`,
    });
    emailResult = { sent: result.sent, error: null };
  } catch (err) {
    emailResult = { sent: 0, error: err.message };
  }

  return NextResponse.json({ ok: true, notice, emailResult }, { status: 201 });
}
