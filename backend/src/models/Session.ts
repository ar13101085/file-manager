import { sessionDb } from '../config/database';
import { Session } from '../types/user.types';
import jwt from 'jsonwebtoken';

export class SessionModel {
  static async create(userId: string, token: string, expiresIn: number = 7 * 24 * 60 * 60 * 1000): Promise<Session> {
    const session: Session = {
      token,
      userId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresIn),
      isBlacklisted: false
    };

    await sessionDb.put(token, JSON.stringify(session));
    await sessionDb.put(`user:${userId}:${token}`, token); // Index for user's sessions
    
    return session;
  }

  static async findByToken(token: string): Promise<Session | null> {
    try {
      const sessionStr = await sessionDb.get(token);
      return JSON.parse(sessionStr);
    } catch (error) {
      return null;
    }
  }

  static async blacklistToken(token: string): Promise<boolean> {
    const session = await this.findByToken(token);
    if (!session) return false;

    session.isBlacklisted = true;
    await sessionDb.put(token, JSON.stringify(session));
    return true;
  }

  static async isTokenValid(token: string): Promise<boolean> {
    const session = await this.findByToken(token);
    if (!session) return false;

    // Check if token is blacklisted
    if (session.isBlacklisted) return false;

    // Check if token is expired
    if (new Date() > new Date(session.expiresAt)) {
      // Clean up expired token
      await this.deleteSession(token);
      return false;
    }

    return true;
  }

  static async deleteSession(token: string): Promise<boolean> {
    const session = await this.findByToken(token);
    if (!session) return false;

    await sessionDb.del(token);
    await sessionDb.del(`user:${session.userId}:${token}`);
    
    return true;
  }

  static async getUserSessions(userId: string): Promise<Session[]> {
    const sessions: Session[] = [];
    
    for await (const [key, value] of sessionDb.iterator()) {
      if (key.startsWith(`user:${userId}:`)) {
        const token = value;
        const session = await this.findByToken(token);
        if (session) {
          sessions.push(session);
        }
      }
    }
    
    return sessions;
  }

  static async blacklistAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.getUserSessions(userId);
    
    for (const session of sessions) {
      await this.blacklistToken(session.token);
    }
  }

  static async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    
    for await (const [key, value] of sessionDb.iterator()) {
      if (!key.includes(':')) { // Only process actual session entries
        const session: Session = JSON.parse(value);
        if (new Date(session.expiresAt) < now) {
          await this.deleteSession(session.token);
        }
      }
    }
  }
}