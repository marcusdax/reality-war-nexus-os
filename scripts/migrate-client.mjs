#!/usr/bin/env node
/**
 * Client-side migration script
 * Calls the system.runMigration procedure via tRPC
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000/api/trpc';

async function runMigration() {
  try {
    console.log('🚀 Running migrations via tRPC...');
    
    const response = await fetch(`${API_URL}/system.runMigration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    
    if (data.result?.data?.success) {
      console.log('✅ Migration successful:', data.result.data.message);
    } else if (data.error) {
      console.error('❌ Migration failed:', data.error);
      process.exit(1);
    } else {
      console.log('📝 Migration result:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMigration();
