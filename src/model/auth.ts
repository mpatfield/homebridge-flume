import { TokenData } from './types';

export class Auth {

  readonly token: string;
  readonly refresh: string;
  readonly expiry: number;

  constructor(data: TokenData) {
    this.token = data.access_token;
    this.refresh = data.refresh_token;
    this.expiry = Date.now() + data.expires_in;

  }
}