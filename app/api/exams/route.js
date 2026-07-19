import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ExamSyllabus from "@/models/ExamSyllabus";
import Student from "@/models/Student";
import { getSessionFromRequest } from "@/lib/auth";
import { sendBulkEmail } from "@/lib/email";

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

  let emailResult = { sent: 0, error: null };
  try {
    const students = await Student.find({ status: "approved", email: { $ne: "" } })
      .select("email")
      .lean();
    const recipients = students.map((s) => s.email).filter(Boolean);
    const detailsHtml = body.details ? `<p>${String(body.details).replace(/</g, "&lt;")}</p>` : "";
    const linkHtml = body.link ? `<p><a href="${body.link}">View full syllabus</a></p>` : "";
    const result = await sendBulkEmail({
      recipients,
      subject: `8WAVES CONNECT — Upcoming exam: ${body.title}`,
      text: `${body.title}${body.examDate ? " — " + body.examDate : ""}\n\n${body.details || ""}${body.link ? "\n\n" + body.link : ""}`,
      html: `<div style="font-family:sans-serif;font-size:15px;color:#111;">
        <p style="font-size:12px;letter-spacing:0.08em;color:#ffb020;font-weight:700;">⚠ UPCOMING EXAM SYLLABUS</p>
        <h2 style="margin:6px 0;">${String(body.title).replace(/</g, "&lt;")}</h2>
        ${body.examDate ? `<p style="color:#555;font-size:13px;">${String(body.examDate).replace(/</g, "&lt;")}</p>` : ""}
        ${detailsHtml}
        ${linkHtml}
        <p style="font-size:12px;color:#888;margin-top:24px;">— 8WAVES CONNECT</p>
      </div>`,
    });
    emailResult = { sent: result.sent, error: null };
  } catch (err) {
    emailResult = { sent: 0, error: err.message };
  }

  return NextResponse.json({ ok: true, exam, emailResult }, { status: 201 });
}
