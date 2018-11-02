import { Component, OnInit } from '@angular/core';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { environment } from '@environments/environment';
import { RouteService } from '@services/route.service';
import { MenuService } from '@services/menu.service';

@Component({
  selector: 'app-ether',
  templateUrl: './ether.component.html',
  styleUrls: ['./ether.component.css']
})
export class EtherComponent implements OnInit {

  private _chainId = environment.chainId;
  private _gasLimit = environment.gas;

  // Step 1: getting your balance
  private _balance: number;

  // Step 2: making a transaction
  private _etherToAddress = '';
  private _etherAmount = 0;
  private _etherError = false;

  constructor(
    private _keyService: KeyService,
    private _menuService: MenuService,
    private _partValidator: Part2ValidationService,
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
    return this._partValidator.hasDoneEtherBalance;
  }

  private get step2Completed(): boolean {
    return this._partValidator.hasDoneEtherTransaction;
  }

  async ngOnInit() {
    this._balance = await this._web3Service.getEtherBalance(this._keyService.getAddress());
    if (!this._partValidator.hasDoneEtherBalance && this._balance > 0) {
      this._partValidator.setHasEtherBalance(true);
    }
  }

  private async transferEther(): Promise<void> {
    let error = false;
    if (this._etherAmount <= 0) {
      console.error('Ether amount must be greater than zero!');
      error = true;
    }
    if (!error) {
      const receipt = await this._web3Service.transferEther(this._keyService.getAddress(),
        this._etherToAddress,
        this._etherAmount,
        this._keyService.getPrivateKey());
      if (receipt != null && !!receipt.status) {
        this._etherAmount = 0;
        this._etherToAddress = '';
        const success = await this._partValidator.submitEtherTransactionHash(receipt.transactionHash);
        if (success) {
          this._menuService.syncMenuItems();
          this._routeService.navigateToPart3();
        }
      } else {
        this._etherError = true;
      }
    }
  }
}
