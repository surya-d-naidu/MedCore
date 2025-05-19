import "dotenv/config";
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

console.log("DATABASE_URL:", process.env.DATABASE_URL);

// Use WebSockets with Neon database
neonConfig.webSocketConstructor = ws;
// Increase timeouts to handle slow connections
neonConfig.connectionTimeoutMillis = 60000; // 60 seconds
neonConfig.queryTimeoutMillis = 30000; // 30 seconds
neonConfig.useSecureWebSocket = true; // Force secure WebSocket

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create the pool with more detailed error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 seconds timeout
});

// Add connection test
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err);
});

// Test connection
pool.connect()
  .then(client => {
    console.log('Database connection successful');
    client.release();
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

export const db = drizzle(pool, { schema });
