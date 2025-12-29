import bcrypt from 'bcryptjs';
import { envConfig as config } from '@/config';

export class BcryptUtil {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, config.bcrypt.saltRounds);
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
