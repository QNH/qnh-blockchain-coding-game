import { Component, OnInit } from '@angular/core';
import { Erc20Service, CreateERC20FromData } from '@services/erc20.service';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { Part3ValidationService } from '@services/access/part3-validation.service';
import { MenuService } from '@services/menu.service';
import { Token } from '@models/token';
import { RouteService } from '@services/route.service';

@Component({
  selector: 'app-erc20',
  templateUrl: './erc20.component.html',
  styleUrls: ['./erc20.component.css']
})
export class Erc20Component implements OnInit {

  // Step 1: deploy a token
  private _createErc20FormData = new CreateERC20FromData();
  private _createErc20Error = false;

  // Step 2: get balance
  private _contractPointer: string;
  private get currentAddress(): string {
    if (!!this._contractPointer && !!this._contractPointer.length) {
      return this._contractPointer;
    } else {
      return this._partValidator.lastContractAddress;
    }
  }
  private _token: Token;

  // Step 3: transfer
  private _transferAmount: number;
  private _transferTo: string;

  // Step 4: events



  constructor(
    private _erc20Service: Erc20Service,
    private _keyService: KeyService,
    private _menuService: MenuService,
    private _partValidator: Part3ValidationService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) { }

  private get nodeAddress(): string {
    return this._web3Service.nodeAddress;
  }

  private get publicKey(): string {
    return this._keyService.getAddress();
  }

  private get step1Completed(): boolean {
    return this._partValidator.hasDoneTokenDeployment;
  }

  private get step2Completed(): boolean {
    return this._partValidator.hasDoneTokenBalance;
  }

  private get step3Completed(): boolean {
    return this._partValidator.hasDoneTokenTransfer;
  }

  private get step4Completed(): boolean {
    return this._partValidator.hasDoneTokenEvent;
  }

  private async deployToken(): Promise<void> {
    try {
      this._createErc20Error = false;
      const contractAddress = await this._erc20Service.deployErc20(this._createErc20FormData);
      this.setToken(contractAddress);
      this._partValidator.submitTokenAddress(contractAddress);
    } catch (e) {
      console.error(e);
      this._createErc20Error = true;
    }
  }

  private async getToken(): Promise<void> {
    this._token = await this._erc20Service.getTokenByAddressAsync(this.currentAddress);
    if (!!this._token) {
      if (!this._token.eventEmitter) {
        this._erc20Service.initTokenEventEmitter(this._token, this.onTokenUpdate.bind(this));
      }
      if (!this._partValidator.hasDoneTokenBalance && !!this._token.balance && !!this._token.balance.length) {
        this._partValidator.setHasDoneTokenBalance(true);
      }
    }
  }

  ngOnInit(): void {
    const currentAddress = this.currentAddress;
    if (!!currentAddress && !!this.currentAddress.length) {
      this.getToken();
    }
  }

  private get lastContractAddress(): string {
    return this._partValidator.lastContractAddress;
  }

  private async onTokenUpdate(error, data): Promise<void> {
    this._token.balance = await this._erc20Service.getBalanceOf(this._token.address);
    if (!this._partValidator.hasDoneTokenEvent) {
      this._partValidator.setHasDoneTokenEvent(true);
      this._menuService.syncMenuItems();
    } else {
      console.log('blad');
    }
  }

  private async transfer(erc20Address: string): Promise<void> {
    if (this._transferAmount > 0 && !!this._transferTo) {
      const result = await this._erc20Service.transfer(
        erc20Address,
        this._keyService.getPrivateKey(),
        this._transferTo,
        this._transferAmount);
      if (result && result.status) {
        delete this._transferAmount;
        delete this._transferTo;
        if (!this._partValidator.hasDoneTokenTransfer) {
          this._partValidator.submitTokenTransferHash(result.transactionHash);
        }
      } else {
        alert('Transaction failed');
      }
    }
  }

  private setToken(erc20Address: string): void {
    this._contractPointer = erc20Address;
    this.getToken();
  }
}
