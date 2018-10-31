import { Component, OnInit, OnDestroy } from '@angular/core';
import { Erc20Service } from '@services/erc20.service';
import { Observable } from 'rxjs/Observable';
import { Token } from '@models/token';
import { Subscription } from 'rxjs/Subscription';
import { CanActivate } from '@angular/router';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { MenuService } from '@services/menu.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-erc20',
  templateUrl: './erc20.component.html',
  styleUrls: ['./erc20.component.css']
})
export class Erc20Component implements OnInit, OnDestroy {

  private _gasLimit = environment.gas;

  // Step 1: getting your balance
  private _balance: number;

  // Step 2: making a transaction
  private _etherToAddress = '';
  private _etherAmount = 0;
  private _etherError = false;

  private _currentToken: Token;
  private _currentTokenAddress = '';

  private _hasValidTokenAddress = false;
  private _newTokenAddress = '';
  private _selectedToken: Token;
  private _transactionHash = '';
  private _tokenTransactionHash = '';
  private _tokens: Token[] = [];
  private _tokenSubscriptions: Subscription;
  private _transferAmount: number;
  private _transferTo: string;

  constructor(
    private _erc20Service: Erc20Service,
    private _keyService: KeyService,
    private _menuService: MenuService,
    private _partValidator: Part2ValidationService,
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
    // return this._partValidator.hasDoneTokenTransaction;
  }

  private get step3Completed(): boolean {
    return !!this._currentToken || this.step4Completed;
  }

  private get step4Completed(): boolean {
    return this._partValidator.partComplete;
  }

  private addToken() {
    if (!this._erc20Service.hasTokenWithAddress(this._newTokenAddress)) {
      const token = new Token();
      token.address = this._newTokenAddress;
      this._erc20Service.addToken(token);
      this._newTokenAddress = '';
    }
  }

  ngOnDestroy() {
    if (!!this._tokenSubscriptions && !this._tokenSubscriptions.closed) {
      this._tokenSubscriptions.unsubscribe();
    }
  }

  async ngOnInit() {
    this._balance = await this._web3Service.getEtherBalance(this._keyService.getAddress());
    if (!this._partValidator.hasDoneEtherBalance && this._balance > 0) {
      this._partValidator.setHasEtherBalance(true);
    }
    this._tokenSubscriptions = this._erc20Service.getTokens().subscribe((tokens) => {
      this._tokens = tokens;
    });
  }

  private async onEtherTransactionHashChange(): Promise<void> {
    if (this._transactionHash.length > 0) {
      const isValid = await this._partValidator.isValidEtherTransactionSubmit(this._transactionHash);
      if (isValid) {
        this._partValidator.submitEtherTransactionHash(this._transactionHash);
      } else {
        const receipt = await this._web3Service.getTransactionReceipt(this._transactionHash);
        if (!receipt) {
          // Receipt not found. Just ignore.
        } else if (!receipt.status) {
          // set status error
          alert('Status error');
        } else if (receipt.from.toLowerCase() !== this._keyService.getAddress(true)) {
          // set incorrect from address
          alert('Transaction not from you');
        } else {
          alert('success!');
        }
      }
    }
  }

  private async onTokenChange(): Promise<void> {
    if (await this._erc20Service.isValidErc20(this._currentTokenAddress)) {
      const token = this._erc20Service.getTokenByAddress(this._currentTokenAddress);
      let timeoutCounter = 9;
      const interval = setInterval(() => {
        if (!!token.balance) {
          this._currentToken = token;
          if (!!this._currentToken.eventEmitter) {
            this._currentToken.eventEmitter.on('data', async (event) => {
              if (!this.step4Completed) {
                this._currentToken.balance = await this._erc20Service.getBalanceOf(this._currentToken.address);
                this._partValidator.submitTokenTransferHash(event.transactionHash);
                this._menuService.syncMenuItems();
                this._erc20Service.addToken(token);
              }
            });
          }
          clearInterval(interval);
        } else if (timeoutCounter <= 0) {
          alert('could not sync. Probably invalid token.');
          clearInterval(interval);
        } else {
          timeoutCounter--;
        }
      }, 500);
    }
  }


  private async onTokenTransactionHashChange(): Promise<void> {
    if (this._tokenTransactionHash.length > 0) {
      const isValid = await this._partValidator.isValidTokenTransactionSubmit(this._tokenTransactionHash);
      if (isValid) {
        this._partValidator.submitTokenTransactionHash(this._tokenTransactionHash);
      } else {
        const receipt = await this._web3Service.getTransactionReceipt(this._tokenTransactionHash);
        if (!receipt) {
          // Receipt not found. Just ignore.
        } else if (!receipt.status) {
          // set status error
          alert('Status error');
        } else if (receipt.from.toLowerCase() !== this._keyService.getAddress(true)) {
          // set incorrect from address
          alert('Transaction not from you');
        } else if (!receipt.contractAddress) {
          alert('No contract deployed');
        } else {
          alert('success!');
        }
      }
    }
  }

  private async transfer(erc20Address: string): Promise<void> {
    if (this._transferAmount > 0 && !!this._transferTo) {
      const result = await this._erc20Service.transfer(
        erc20Address,
        this._keyService.getPrivateKey(),
        this._transferTo,
        this._transferAmount);
      if (result) {
        delete this._transferAmount;
        delete this._transferTo;
      } else {
        alert('Transaction failed');
      }
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
        this._partValidator.submitEtherTransactionHash(receipt.transactionHash);
      }
    }
  }

  private saveToken(): void {
    if (!this._newTokenAddress) {
      // ignore.
    } else if (this._erc20Service.hasTokenWithAddress(this._newTokenAddress)) {
      alert('Address already known');
    } else if (!this._erc20Service.isValidErc20(this._newTokenAddress)) {
      alert('Not a valid Token.');
    } else {
      const token = new Token();
      token.address = this._newTokenAddress;
      this._erc20Service.addToken(token);
      this._newTokenAddress = '';
    }
  }
}

class FormData {
  addressTo: string;
  amount: number;
}
