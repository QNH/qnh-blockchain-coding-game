import { Injectable } from '@angular/core';

@Injectable()
export class KeyService {
  private readonly storageKey = 'bcg-key';
  // TODO
  // This service is basically a clusterfck.service.ts at this point.

  private _privateKey: string;

  constructor() {

   }

  getPublicKey(): string {
    return '0x88e94a4b7bfc62a38d300d98ce1c09f30fb75e3e';
  }

  getPrivateKey(): string {
    return '0x00351d8f054a232c52d86b6bf4acd372b6a844ab874e8508bb5b1e8117e47414';
  }

}
