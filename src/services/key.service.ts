import { Injectable } from '@angular/core';
import { Web3Service } from '@services/web3.service';
import { Account } from 'web3/eth/accounts';

@Injectable()
export class KeyService {
  private readonly storageKey = 'bcg-key';
  // TODO
  // This service is basically a clusterfck.service.ts at this point.

  private _account: Account;

  constructor(
    private _web3Service: Web3Service
  ) {
    let privateKey = localStorage.getItem(this.storageKey);
    while (!privateKey || !privateKey.length) {
      privateKey = window.prompt('Er is nog geen keypair gevonden. Welke private key wil je gebruiken?');
    }
    this.setPrivateKey(privateKey);
   }

   getAddress(): string {
     return this._account.address;
   }

  getPublicKey(): string {
    return this._account.publicKey;
  }

  getPrivateKey(): string {
    return this._account.privateKey;
  }

  public async setPrivateKey(privateKey: string): Promise<void> {
    this._account = await this._web3Service.getAccountByPrivateKey(privateKey);
    localStorage.setItem(this.storageKey, privateKey);
  }
}
