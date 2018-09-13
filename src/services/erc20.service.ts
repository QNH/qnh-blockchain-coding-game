import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as TokenAbi from '@contracts/erc20';
import { Web3Service } from '@services/web3.service';
import { environment } from '@environments/environment';
import Contract from 'web3/eth/contract';
import { Token } from '@models/token';

@Injectable()
export class Erc20Service {
  private readonly _storageKey = 'bcg-tokens';

  private _tokens: BehaviorSubject<Token[]> = new BehaviorSubject([]);

  constructor(
    private _web3Service: Web3Service
  ) {
    const tokens = localStorage.getItem(this._storageKey);
    if (!!tokens && !!tokens.length) {
      try {
        this._tokens.next(JSON.parse(tokens));
      } catch (e) {
        console.warn('Error while parsing localstorage.tokens. Resetting now...');
        localStorage.setItem(this._storageKey, '');
      }
    }
  }

  /**
   * Add token to web application memory
   * @param token The token to be added
   */
  addToken(token: Token): void {
    const tokens = this._tokens.getValue();
    tokens.push(token);
    this._tokens.next(tokens);
    this.saveTokens();
  }

  /**
   * Get the Balance of an account of an ERC20 token
   * @param erc20Address The address of the token
   * @param accountAddress The address of the account
   */
  async getBalanceOf(erc20Address: string, accountAddress: string): Promise<string> {
    const contract = await this.getContract(erc20Address);
    return await contract.methods.balanceOf(accountAddress).call();
  }

  private async getContract(erc20Address: string = null): Promise<Contract> {
    return this._web3Service.getContract(TokenAbi, erc20Address);
  }

  /**
   * Get the name of an ERC20 contract
   * @param erc20Address The address of the token
   */
  async getName(erc20Address: string): Promise<string> {
    const contract = await this.getContract(erc20Address);
    return await contract.methods.name().call();
  }

  getTokens(): Observable<Token[]> {
    return this._tokens.asObservable();
  }

  hasTokenWithAddress(address: string): boolean {
    const tokens = this._tokens.getValue();
    let token: Token;
    for (let i = 0; i < tokens.length; i++ ) {
      token = tokens[i];
      if (token.address === address) {
        return true;
      }
    }
    return false;
  }

  private saveTokens(): void {
    localStorage.setItem(this._storageKey, JSON.stringify(this._tokens.getValue()));
  }

  /**
   * Transfer an amount of a ERC20 token to another account
   * @param erc20Address The address of the token
   * @param privateKey The private key to sign from
   * @param to The address to transfer to
   * @param amount The amount to transfer
   */
  async transfer(erc20Address: string, privateKey: string, to: string, amount: number): Promise<boolean> {
    // First, we need to define what the transaction will do. For this, inform
    // the contract of the data
    const contract = await this.getContract(erc20Address);
    const method = contract.methods.transfer(to, amount);

    // Then, declare the transaction
    const transaction = {
      // Each blockchain network is defined by a (semi-)unique number. This
      // is called the chain id.
      chainId: environment.chainId,
      // Each transaction costs gas, and is limited in the amount of gas
      // you can spend per transaction
      gas: environment.gas,
      // You don't send the transaction to the other account. You instead
      // send it to the contract, and the contract decides what happens.
      to: erc20Address,
      // The blockchain only receives Abstract Binary Interface (ABI) data.
      // In order to make the transaction accept the data, encode it.
      data: method.encodeABI()
    };
    const receipt = await this._web3Service.sendTransaction(transaction, privateKey);
    return (!!receipt && !!receipt.status);
  }

}
