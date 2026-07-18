/**
 * Creates (or updates the password of) the single admin account,
 * using ADMIN_USERNAME / ADMIN_PASSWORD from your environment.
 *
 * Run locally with:  npm run seed:admin
 * (loads .env.local automatically via the `dotenv` require below)
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

async function main() {
  const { MONGODB_URI, ADMIN_USERNAME, ADMIN_PASSWORD } = process.env;

  if (!MONGODB_URI) throw new Error("Set MONGODB_URI in .env.local first.");
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD)
    throw new Error("Set ADMIN_USERNAME and ADMIN_PASSWORD in .env.local first.");

  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  });
  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const result = await Admin.findOneAndUpdate(
    { username: ADMIN_USERNAME },
    { username: ADMIN_USERNAME, passwordHash },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready for username: ${result.username}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
