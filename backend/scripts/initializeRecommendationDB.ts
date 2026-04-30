/**
 * Database Initialization Script for Recommendation System
 * File: backend/scripts/initializeRecommendationDB.ts
 * 
 * This script initializes the database schema for the Rule-Based AI
 * recommendation system. It creates all necessary tables, indexes,
 * views, and default data required for the system to function.
 * 
 * Usage: npx ts-node backend/scripts/initializeRecommendationDB.ts
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

interface InitResult {
  success: boolean;
  message: string;
  tablesCreated: string[];
  errors: string[];
  executionTime: number;
}

async function executeSQL(connection: any, sqlFilePath: string): Promise<InitResult> {
  const startTime = Date.now();
  const result: InitResult = {
    success: true,
    message: 'Database initialization completed',
    tablesCreated: [],
    errors: [],
    executionTime: 0
  };

  try {
    // Read SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf-8');
    
    // Split SQL statements by semicolon (basic parsing)
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`\n📊 Executing ${statements.length} SQL statements...`);
    console.log('═'.repeat(70));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      try {
        console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
        
        // Extract table name from CREATE or ALTER statement
        const createMatch = statement.match(/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS\s+(\w+)/i);
        const alterMatch = statement.match(/ALTER\s+TABLE\s+(\w+)/i);
        const tableName = createMatch?.[1] || alterMatch?.[1] || 'view/rule';

        await connection.execute(statement);
        
        if (createMatch) {
          result.tablesCreated.push(tableName);
          console.log(`✅ Table '${tableName}' created successfully`);
        } else if (statement.includes('INSERT INTO')) {
          console.log(`✅ Data inserted successfully`);
        } else if (statement.includes('CREATE OR REPLACE VIEW')) {
          console.log(`✅ View created successfully`);
        } else {
          console.log(`✅ Statement executed successfully`);
        }
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        // Skip duplicate key errors as they're expected with INSERT
        if (!errorMsg.includes('Duplicate entry')) {
          console.error(`❌ Error: ${errorMsg}`);
          result.errors.push(errorMsg);
          result.success = false;
        } else {
          console.log(`⚠️  Skipped: ${errorMsg.substring(0, 50)}...`);
        }
      }
    }

    result.executionTime = Date.now() - startTime;

  } catch (error: any) {
    result.success = false;
    result.message = `Failed to initialize database: ${error.message}`;
    result.errors.push(error.message);
  }

  return result;
}

async function verifyTables(connection: any): Promise<boolean> {
  console.log('\n📋 Verifying tables...');
  console.log('═'.repeat(70));

  const requiredTables = [
    'user_segments',
    'user_preferences',
    'recommendation_history',
    'learning_paths',
    'user_skills',
    'course_tags',
    'recommendation_rules',
    'recommendation_logs',
    'recommendation_feedback_log',
    'ab_test_recommendations'
  ];

  try {
    for (const tableName of requiredTables) {
      const [rows]: any = await connection.execute(
        `SELECT COUNT(*) as count FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [tableName]
      );

      if (rows[0]?.count > 0) {
        console.log(`✅ Table '${tableName}' exists`);
      } else {
        console.log(`❌ Table '${tableName}' NOT FOUND`);
        return false;
      }
    }

    return true;
  } catch (error: any) {
    console.error(`❌ Verification error: ${error.message}`);
    return false;
  }
}

async function getTableStats(connection: any): Promise<void> {
  console.log('\n📊 Table Statistics:');
  console.log('═'.repeat(70));

  const tables = [
    'user_segments',
    'user_preferences',
    'recommendation_history',
    'learning_paths',
    'user_skills',
    'course_tags',
    'recommendation_rules',
    'recommendation_logs',
    'recommendation_feedback_log',
    'ab_test_recommendations'
  ];

  try {
    for (const tableName of tables) {
      const [rows]: any = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      console.log(`  ${tableName}: ${rows[0]?.count || 0} records`);
    }
  } catch (error: any) {
    console.error(`Warning: Could not fetch stats - ${error.message}`);
  }
}

async function main(): Promise<void> {
  console.log('\n🚀 Starting Recommendation System Database Initialization');
  console.log('═'.repeat(70));

  let connection: any = null;

  try {
    // Verify environment variables
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    };

    console.log('\n🔧 Database Configuration:');
    console.log(`  Host: ${dbConfig.host}`);
    console.log(`  User: ${dbConfig.user}`);
    console.log(`  Database: ${dbConfig.database}`);

    if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
      throw new Error('Missing required database environment variables (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
    }

    // Connect to database
    console.log('\n🔌 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established');

    // Execute SQL schema
    const sqlFilePath = path.join(process.cwd(), 'backend', 'scripts', 'create_recommendation_tables.sql');
    console.log(`\n📂 Reading SQL file: ${sqlFilePath}`);

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found: ${sqlFilePath}`);
    }

    const initResult = await executeSQL(connection, sqlFilePath);

    // Verify tables
    const tablesVerified = await verifyTables(connection);

    // Get statistics
    if (tablesVerified) {
      await getTableStats(connection);
    }

    // Final report
    console.log('\n' + '═'.repeat(70));
    console.log('📋 Initialization Report');
    console.log('═'.repeat(70));
    console.log(`Status: ${initResult.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Tables Created: ${initResult.tablesCreated.length}`);
    console.log(`Errors: ${initResult.errors.length}`);
    console.log(`Execution Time: ${initResult.executionTime}ms`);

    if (initResult.tablesCreated.length > 0) {
      console.log('\nTables Created:');
      initResult.tablesCreated.forEach(table => {
        console.log(`  - ${table}`);
      });
    }

    if (initResult.errors.length > 0) {
      console.log('\nErrors Encountered:');
      initResult.errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error.substring(0, 60)}...`);
      });
      if (initResult.errors.length > 5) {
        console.log(`  ... and ${initResult.errors.length - 5} more errors`);
      }
    }

    console.log('\n✅ Database initialization completed!');
    console.log('═'.repeat(70) + '\n');

    process.exit(initResult.success ? 0 : 1);

  } catch (error: any) {
    console.error('\n❌ Fatal Error:');
    console.error(`  ${error.message}`);
    console.error('═'.repeat(70) + '\n');
    process.exit(1);

  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run initialization
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
