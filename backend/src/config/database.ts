import { Level } from 'level';
import path from 'path';

// Create database directory
const dbPath = path.join(__dirname, '../../data');

// Initialize LevelDB instances
export const userDb = new Level(path.join(dbPath, 'users'));
export const sessionDb = new Level(path.join(dbPath, 'sessions'));
export const permissionDb = new Level(path.join(dbPath, 'permissions'));

// Initialize databases
export const initDatabase = async () => {
  try {
    // LevelDB automatically opens when created, so we just need to test it
    await userDb.get('test').catch(() => {}); // Test connection
    await sessionDb.get('test').catch(() => {});
    await permissionDb.get('test').catch(() => {});
    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

// Check if any users exist
export const hasUsers = async (): Promise<boolean> => {
  try {
    const iterator = userDb.iterator({ limit: 1 });
    const [entry] = await iterator.all();
    await iterator.close();
    return !!entry;
  } catch (error) {
    return false;
  }
};