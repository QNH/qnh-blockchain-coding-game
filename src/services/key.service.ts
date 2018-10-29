import { Injectable } from '@angular/core';
import { Web3Service } from '@services/web3.service';
import { Account } from 'web3/eth/accounts';

@Injectable()
export class KeyService {
  private readonly storageKey = 'bcg-key';

  private _account: Account;
  private _privateKey: string;

  constructor(
    private _web3Service: Web3Service
  ) { }

  private get account(): Account {
    if (!this._account && !!this.privateKey) {
      this._account = this._web3Service.getAccountByPrivateKey(this.privateKey);
    }
    return this._account;
  }

  getAddress(makeLowerCase = false): string {
    if (this.hasAccount) {
      let address = this.account.address;
      if (makeLowerCase && !!address) {
        address = address.toLowerCase();
      }
      return address;
    } else {
      return undefined;
    }
  }

  getPrivateKey(): string {
    return this.hasAccount ? this.account.privateKey : undefined;
  }

  get hasAccount(): boolean {
    return !!this.account;
  }

  get isPrivateKeySet(): boolean {
    return !!this.privateKey;
  }

  get privateKey(): string {
    if (!this._privateKey) {
      this._privateKey = localStorage.getItem(this.storageKey);
    }
    return this._privateKey;
  }

  /**
   * Reset the account the app uses
   */
  resetKey(): void {
    delete this._account;
    localStorage.setItem(this.storageKey, '');
  }

  public async setPrivateKey(privateKey: string): Promise<void> {
    this._privateKey = privateKey;
    localStorage.setItem(this.storageKey, this.account.privateKey);
  }
}
