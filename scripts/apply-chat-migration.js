import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('Applying chat system optimizations...');

  try {
    // Read the migration SQL
    const migrationPath = path.join(__dirname, '../prisma/migrations/20250615000000_optimize_chat_system/migration.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Split the SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    // Execute each statement
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(`${statement};`);
        console.log(`Successfully executed: ${statement.substring(0, 50)}...`);
      } catch (error) {
        // If the error is about an index already existing, we can ignore it
        if (error.message.includes('already exists')) {
          console.log(`Index already exists: ${statement.substring(0, 50)}...`);
        } else {
          throw error;
        }
      }
    }

    console.log('Chat system optimizations applied successfully!');
  } catch (error) {
    console.error('Error applying chat system optimizations:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 