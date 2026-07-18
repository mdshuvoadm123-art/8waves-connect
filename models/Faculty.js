import mongoose from "mongoose";

const FacultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    room: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 800 },
    photoUrl: { type: String, trim: true },
    courses: { type: String, trim: true }, // comma separated courses taught
    order: { type: Number, default: 0 }, // manual display order set by admin
  },
  { timestamps: true }
);

export default mongoose.models.Faculty || mongoose.model("Faculty", FacultySchema);
