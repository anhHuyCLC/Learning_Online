import connectDB from "../config/db";

const db = await connectDB();


export const createUser = async (
    name: string,
    email: string,
    password: string,
    role: string
) => {

    const [result]: any = await db.execute(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        [name, email, password, role]
    );

    return result;
};

export const findUserByEmail = async (email: string) => {

  const [rows]: any = await db.execute(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );

  return rows;
};