import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { RouteService } from '@services/route.service';
import { Part2ValidationService } from '@services/access/part2-validation.service';

@Injectable()
export class Part3ValidationService implements CanActivate {

  private _tokenAddress: string;
  private readonly TokenAddressStorageKey = 'bcg_token_transaction_hash';

  private _hasDoneTokenBalance: boolean;
  private readonly HasDoneTokenBalanceStorageKey = 'bcg_erc20_has_done_balance';

  private _tokenTransferHash: string;
  private readonly TokenTransferHashStorageKey = 'bcg_token_transfer_hash';

  private _hasDoneTokenEvent: boolean;
  private readonly HasDoneTokenEventStorageKey = 'bcg_erc20_has_done_event';

  constructor(
    private _part2ValidationService: Part2ValidationService,
    private _routeService: RouteService
  ) {
    const tokenAddress = localStorage.getItem(this.TokenAddressStorageKey);
    if (!!tokenAddress) {
      this._tokenAddress = tokenAddress;
    }
    this._hasDoneTokenBalance = localStorage.getItem(this.HasDoneTokenBalanceStorageKey) == 'true';
    const tokenTransferHash = localStorage.getItem(this.TokenTransferHashStorageKey);
    if (!!tokenTransferHash) {
      this._tokenTransferHash = tokenTransferHash;
    }
    this._hasDoneTokenEvent = localStorage.getItem(this.HasDoneTokenEventStorageKey) == 'true';
   }

   // @ts-ignore
  canActivate(redirectOnFalse: boolean = true): boolean {
    if (this._part2ValidationService.partComplete) {
      return true;
    } else if (redirectOnFalse) {
      this._routeService.navigateToPart1();
    } else {
      return false;
    }
  }

  get hasDoneTokenBalance(): boolean {
    return this._hasDoneTokenBalance;
  }

  get hasDoneTokenDeployment(): boolean {
    return !!this._tokenAddress;
  }

  get hasDoneTokenEvent(): boolean {
    return this._hasDoneTokenEvent;
  }

  get hasDoneTokenTransfer(): boolean {
    return !!this._tokenTransferHash;
  }

  public get lastContractAddress(): string {
    return this._tokenAddress;
  }

  get partComplete(): boolean {
    return this.hasDoneTokenDeployment && 
    this.hasDoneTokenBalance && 
    this.hasDoneTokenTransfer && 
    this.hasDoneTokenEvent;
  }

  reset(): void {
    this.setHasDoneTokenBalance(false);
    this.setHasDoneTokenEvent(false);
    this._tokenAddress = '';
    this._tokenTransferHash = '';
    localStorage.setItem(this.TokenAddressStorageKey, this._tokenAddress);
    localStorage.setItem(this.TokenTransferHashStorageKey, this._tokenTransferHash);
  }

  setHasDoneTokenBalance(has: boolean): void {
    this._hasDoneTokenBalance = has;
    localStorage.setItem(this.HasDoneTokenBalanceStorageKey, has + '');
  }

  setHasDoneTokenEvent(has: boolean): void {
    this._hasDoneTokenEvent = has;
    localStorage.setItem(this.HasDoneTokenEventStorageKey, has + '');
  }

  submitTokenAddress(contractAddress: string): void {
    this._tokenAddress = contractAddress;
    localStorage.setItem(this.TokenAddressStorageKey, contractAddress);
  }

  submitTokenTransferHash(transactionHash: string): void {
    this._tokenTransferHash = transactionHash;
    localStorage.setItem(this.TokenTransferHashStorageKey, this._tokenTransferHash);
  }

}
