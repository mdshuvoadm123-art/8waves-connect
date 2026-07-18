import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, trim: true },
    session: { type: String, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    bloodGroup: { type: String, trim: true },
    hometown: { type: String, trim: true },
    bio: { type: String, trim: true, maxlength: 600 },
    photoUrl: { type: String, trim: true },
    socialLink: { type: String, trim: true },
    // Workflow status. New submissions and edits always reset to "pending"
    // and only become visible on the public page once an admin approves them.
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Holds the previous approved snapshot so an admin can compare
    // "current live version" vs "requested changes" before approving an edit.
    pendingChanges: { type: mongoose.Schema.Types.Mixed, default: null },
    submittedBy: { type: String, trim: true }, // contact info of submitter, for admin follow-up
    reviewNote: { type: String, trim: true, default: "" },
    // If this submission is an update request for an already-approved profile,
    // this holds that profile's _id. On approval the admin's action copies
    // these fields onto the original profile instead of creating a duplicate.
    replacesId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
