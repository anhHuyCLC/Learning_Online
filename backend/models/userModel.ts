import connectDB from "../config/db";

export const createUser = async (
    name: string,
    email: string,
    password: string,
    role: string
) => {
    const db: any = await connectDB();

    const [result]: any = await db.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
    );

    return result;
};

export const findUserByEmail = async (email: string) => {
  const db: any = await connectDB();

  const [rows]: any = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows;
};