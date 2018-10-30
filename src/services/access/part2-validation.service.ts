import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { RouteService } from '@services/route.service';
import { Erc20Service } from '@services/erc20.service';

@Injectable()
export class Part2ValidationService implements CanActivate {

  private _etherTransactionHash: string;
  private readonly EtherTransactionHashStorageKey = 'bcg_ether_transaction_hash';

  private _tokenTransactionHash: string;
  private readonly TokenTransactionHashStorageKey = 'bcg_token_transaction_hash';

  private _tokenTransferHash: string;
  private readonly TokenTransferHashStorageKey = 'bcg_token_transfer_hash';

  constructor(
    private _erc20Service: Erc20Service,
    private _keyService: KeyService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) {
    const etherTransactionHash = localStorage.getItem(this.EtherTransactionHashStorageKey);
    if (!! etherTransactionHash) {
      this._etherTransactionHash = etherTransactionHash;
    }
    const tokenTransactionHash = localStorage.getItem(this.TokenTransactionHashStorageKey);
    if (!!tokenTransactionHash) {
      this._tokenTransactionHash = tokenTransactionHash;
    }
    const tokenTransferHash = localStorage.getItem(this.TokenTransferHashStorageKey);
    if (!!tokenTransferHash) {
      this._tokenTransferHash = tokenTransferHash;
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

  async isValidTokenTransactionSubmit(transactionHash: string): Promise<boolean> {
    const isValidTransaction = await this.isValidEtherTransactionSubmit(transactionHash);
    if (isValidTransaction) {
      const receipt = await this._web3Service.getTransactionReceipt(transactionHash);
      if (!!receipt.contractAddress) {
        return await this._erc20Service.isValidErc20(receipt.contractAddress);
      }
    }
    return false;
  }

  get hasDoneEtherTransaction(): boolean {
    return !!this._etherTransactionHash;
  }

  get hasDoneTokenTransaction(): boolean {
    return !!this._tokenTransactionHash;
  }

  get hasDoneTokenTransfer(): boolean {
    return !!this._tokenTransferHash;
  }

  get partComplete(): boolean {
    return this.hasDoneEtherTransaction && this.hasDoneTokenTransaction && this.hasDoneTokenTransfer;
  }

  reset(): void {
    this._etherTransactionHash = '';
    this._tokenTransactionHash = '';
    this._tokenTransferHash = '';
    localStorage.setItem(this.EtherTransactionHashStorageKey, this._etherTransactionHash);
    localStorage.setItem(this.TokenTransactionHashStorageKey, this._tokenTransactionHash);
    localStorage.setItem(this.TokenTransferHashStorageKey, this._tokenTransferHash);
  }

  submitEtherTransactionHash(transactionHash: string): void {
    (async () => {
      if (await this.isValidEtherTransactionSubmit(transactionHash)) {
        const receipt = await this._web3Service.getTransactionReceipt(transactionHash);
        this._etherTransactionHash = receipt.transactionHash;
        localStorage.setItem(this.EtherTransactionHashStorageKey, this._etherTransactionHash);
      }
    })();
  }

  submitTokenTransactionHash(transactionHash: string): void {
    (async () => {
      if (await this.isValidTokenTransactionSubmit(transactionHash)) {
        const receipt = await this._web3Service.getTransactionReceipt(transactionHash);
        this._tokenTransactionHash = receipt.transactionHash;
        localStorage.setItem(this.TokenTransactionHashStorageKey, this._tokenTransactionHash);
      }
    })();
  }

  submitTokenTransferHash(transactionHash: string): void {
    this._tokenTransferHash = transactionHash;
    localStorage.setItem(this.TokenTransferHashStorageKey, this._tokenTransferHash);
  }

}
