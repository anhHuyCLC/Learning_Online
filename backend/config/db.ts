import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Khởi tạo pool ở phạm vi global để tái sử dụng
let pool: mysql.Pool;

async function connectDB() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 20, // 20 là đủ dùng, 300 là quá mức cần thiết
            queueLimit: 0
        });
        console.log("MySQL pool created successfully");
    }
    return pool;
}

export default connectDB;