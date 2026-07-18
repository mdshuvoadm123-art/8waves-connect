import mongoose from "mongoose";

const ExamSyllabusSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true }, // e.g. "Fluid Mechanics Midterm"
    examDate: { type: String, trim: true }, // free text, e.g. "August 5, 2026"
    details: { type: String, trim: true, maxlength: 800 }, // syllabus / topics covered
    link: { type: String, trim: true }, // optional Drive link to full syllabus doc
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.ExamSyllabus || mongoose.model("ExamSyllabus", ExamSyllabusSchema);
