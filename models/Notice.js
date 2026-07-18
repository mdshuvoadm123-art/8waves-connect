import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    message: { type: String, required: true, trim: true, maxlength: 300 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
