import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { RouteService } from '@services/route.service';
import { Erc20Service } from '@services/erc20.service';

@Injectable()
export class Part2ValidationService implements CanActivate {

  private _hasEtherBalance: boolean;
  private readonly HasEtherBalanceStorageKey = 'bcg_ether_has_balance';

  private _etherTransactionHash: string;
  private readonly EtherTransactionHashStorageKey = 'bcg_ether_transaction_hash';

  constructor(
    private _erc20Service: Erc20Service,
    private _keyService: KeyService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) {
    const hasEtherBalance = localStorage.getItem(this.HasEtherBalanceStorageKey);
    this._hasEtherBalance = !!hasEtherBalance;
    const etherTransactionHash = localStorage.getItem(this.EtherTransactionHashStorageKey);
    if (!! etherTransactionHash) {
      this._etherTransactionHash = etherTransactionHash;
    }
   }

   // @ts-ignore
  canActivate(redirectOnFalse: boolean = true): boolean {
    if (this._keyService.isPrivateKeySet && this._web3Service.hasNodeAddress) {
      return true;
    } else if (redirectOnFalse) {
      this._routeService.navigateToPart1();
    } else {
      return false;
    }
  }

  async isValidEtherTransactionSubmit(transactionHash: string): Promise<boolean> {
    const receipt = await this._web3Service.getTransactionReceipt(transactionHash);
    try {
      if (
        !!receipt && !!receipt.status && receipt.from.toLowerCase() === this._keyService.getAddress(true)
      ) {
        return true;
      }
    } catch { }
    return false;
  }

  get hasDoneEtherBalance(): boolean {
    return this._hasEtherBalance;
  }

  get hasDoneEtherTransaction(): boolean {
    return !!this._etherTransactionHash;
  }

  get partComplete(): boolean {
    return this.hasDoneEtherTransaction && this.hasDoneEtherBalance;
  }

  reset(): void {
    this._hasEtherBalance = false;
    this._etherTransactionHash = '';
    localStorage.setItem(this.HasEtherBalanceStorageKey, 'false');
    localStorage.setItem(this.EtherTransactionHashStorageKey, this._etherTransactionHash);
  }

  setHasEtherBalance(has: boolean): void {
    this._hasEtherBalance = has;
    localStorage.setItem(this.HasEtherBalanceStorageKey, has + '');
  }

  public async submitEtherTransactionHash(transactionHash: string): Promise<boolean> {
    if (await this.isValidEtherTransactionSubmit(transactionHash)) {
      const receipt = await this._web3Service.getTransactionReceipt(transactionHash);
      this._etherTransactionHash = receipt.transactionHash;
      localStorage.setItem(this.EtherTransactionHashStorageKey, this._etherTransactionHash);
      return true;
    }
    return false;
  }

}
