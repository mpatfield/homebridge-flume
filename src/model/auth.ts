import crypto from 'crypto';
import storage from 'node-persist';

import { JwtPayload, TokenData } from './types.js';

import { DAY, SECOND } from '../tools/time.js';
import { jwtDecode } from 'jwt-decode';

const STORAGE_AUTH_KEY = 'auth';

export class Auth {

  private _userId: string | undefined;

  constructor(
    private readonly data: TokenData,
    private readonly created: number = Date.now(),
  ){}

  get token(): string {
    return this.data.access_token;
  }

  get userId(): string | undefined {
    if (!this._userId) {
      this._userId = (jwtDecode(this.token) as JwtPayload).user_id;
    }
    return this._userId;
  }

  get refresh(): string {
    return this.data.refresh_token;
  }

  get expiry() : number {
    return this.created + (this.data.expires_in * SECOND) - DAY;
  }

  private static digest(encryptionKey: string): Buffer {
    return crypto.createHash('sha256').update(encryptionKey).digest();
  }

  private static async initStorage(persistPath: string): Promise<void> {
    await storage.init({ dir: persistPath });
  }

  async save(persistPath: string, encryptionKey: string): Promise<void> {

    try {

      await Auth.initStorage(persistPath);

      const serailzed = JSON.stringify({
        data: this.data,
        created: this.created,
      });

      const digest = Auth.digest(encryptionKey);
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', digest, iv);
      const encrypted = Buffer.concat([cipher.update(serailzed, 'utf8'), cipher.final()]);
      const final = iv.toString('hex') + ':' + encrypted.toString('hex');

      await storage.set(STORAGE_AUTH_KEY, final);
    } catch (err) {
      // Nothing
    }
  }

  static async load(persistPath: string, encryptionKey: string): Promise<Auth | null> {

    try {

      await Auth.initStorage(persistPath);

      const final = await storage.get(STORAGE_AUTH_KEY);
      if (!final) {
        return null;
      }

      const digest = Auth.digest(encryptionKey);
      const [ivHex, encryptedHex] = final.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', digest, iv);
      const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');

      const obj = JSON.parse(decrypted) as { data: TokenData, created: number };
      return new Auth(obj.data, obj.created);
      
    } catch {
      return null;
    }
  }
}