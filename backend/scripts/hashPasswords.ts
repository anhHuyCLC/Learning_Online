import dotenv from "dotenv";
import bcrypt from "bcrypt";
import connectDB from "../config/db";

dotenv.config();

async function run() {
  const db = await connectDB();

  // Select users
  const [rows]: any = await db.execute("SELECT id, email, password FROM users");

  for (const user of rows) {
    const pwd: string = user.password || "";

    // Heuristic: bcrypt hashes typically start with $2 (e.g. $2b$) and are long
    const looksHashed = typeof pwd === "string" && pwd.startsWith("$2") && pwd.length > 50;

    if (!looksHashed) {
      console.log(`Hashing password for user id=${user.id} email=${user.email}`);
      const hashed = await bcrypt.hash(pwd, 10);
      await db.execute("UPDATE users SET password = ? WHERE id = ?", [hashed, user.id]);
    } else {
      // skip
    }
  }

  console.log("Done. All plaintext passwords (if any) have been hashed.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Error running hashPasswords:", err);
  process.exit(1);
});
