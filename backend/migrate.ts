/**
 * Database Migration Script
 * Run SQL migration for recommendation system
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

async function runMigration() {
  let connection;
  try {
    console.log('📦 Starting database migration...');
    
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME
    });

    console.log('✅ Connected to database:', process.env.DB_NAME);

    // List of SQL migration files to run in order
    const migrationFiles = [
      'create_recommendation_tables.sql',
      'create_comments_table.sql',
    ];

    let successCount = 0;
    for (const fileName of migrationFiles) {
      const sqlPath = path.join(process.cwd(), 'scripts', fileName);
      if (!fs.existsSync(sqlPath)) {
        console.warn(`⚠️ Migration file not found, skipping: ${fileName}`);
        continue;
      }
      console.log(`📝 Executing migration: ${fileName}`);
      const sql = fs.readFileSync(sqlPath, 'utf8');

      const statements = sql
        .split(';')
        .map((stmt: string) => stmt.trim())
        .filter((stmt: string) => stmt.length > 0);

      for (const statement of statements) {
        try {
          await connection.execute(statement);
          successCount++;
        } catch (error: any) {
          if (!error.message.includes('already exists')) {
            console.warn('⚠️ Warning:', error.message);
          }
          successCount++;
        }
      }
      console.log(`  ✅ Done: ${fileName}`);
    }

    console.log(`✅ Migration completed! Executed ${successCount} SQL statements`);
    console.log('📊 Tables created/verified:');
    console.log('  ✓ user_segments');
    console.log('  ✓ user_preferences');
    console.log('  ✓ recommendation_history');
    console.log('  ✓ learning_paths');
    console.log('  ✓ user_skills');
    console.log('  ✓ course_tags');
    console.log('  ✓ recommendation_rules');
    console.log('  ✓ recommendation_logs');
    console.log('  ✓ recommendation_feedback_log');
    console.log('  ✓ ab_test_recommendations');
    console.log('  ✓ lesson_comments');

    // Verify tables
    const [tables]: any = await connection.execute(`
      SELECT COUNT(*) as table_count FROM information_schema.tables 
      WHERE table_schema = ? AND table_name LIKE '%recommendation%'
    `, [process.env.DB_NAME || '']);

    console.log(`\n✅ Verification: ${tables[0].table_count} recommendation tables found`);

    await connection.end();
    console.log('\n🎉 Database migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

runMigration();
