import mongoose from "mongoose";

// A simple named link to a Google Drive folder/file — e.g. "Software",
// "1-1", "1-2", "2-1". Managed entirely by the admin; clicking one on the
// public site just opens driveLink in a new tab.
const MaterialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    driveLink: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Material || mongoose.model("Material", MaterialSchema);
