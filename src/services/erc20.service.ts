import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Web3Service } from '@services/web3.service';
import { environment } from '@environments/environment';
import Contract from 'web3/eth/contract';
import { Token } from '@models/token';
import { KeyService } from '@services/key.service';
import { EventEmitter, TransactionReceipt } from 'web3/types';
import { DeploymentService } from '@services/deployment.service';
import { Callback } from 'web3/types';
import { EventLog } from 'web3/types';

@Injectable()
export class Erc20Service {
  constructor(
    private _deploymentService: DeploymentService,
    private _keyService: KeyService,
    private _web3Service: Web3Service
  ) { }

  /**
   * Deploy a new ERC20 contract, based on @contracts/erc20.json. 
   * @param formData The data required to deploy an ERC20 contract
   * @returns The new contract address
   */
  public async deployErc20(formData: CreateERC20FromData): Promise<string> {
    const erc20Contract = require('@contracts/erc20.json');
    return this._deploymentService.deployContract(erc20Contract.abi, erc20Contract.bin, [
      this._web3Service.stringToBytes(formData.name),
      formData.totalSupply
    ]);
  }

  /**
   * Get the Balance of an account of an ERC20 token
   * @param erc20Address The address of the token
   * @param accountAddress The address of the account
   */
  async getBalanceOf(erc20Address: string, accountAddress: string = this._keyService.getAddress()): Promise<any> {
    // Make an Ethereum call to get the balance.
    // Should be 2 lines.
    return '';
  }

  private async getContract(erc20Address: string = null): Promise<Contract> {
    const tokenContract = require('@contracts/erc20.json');
    return this._web3Service.getContract(tokenContract.abi, erc20Address);
  }

  /**
   * Get the name of an ERC20 contract
   * @param erc20Address The address of the token
   */
  async getName(erc20Address: string): Promise<string> {
    // The smart contracts only stores bytes, so we have 
    // to make the readable. This have been done already 
    // Should be 2 lines
    const bytes = '';
    return this._web3Service.bytesToString(bytes);
  }

  getTokenByAddress(tokenAddress: string): Token {
    const token = new Token();
    token.address = tokenAddress;
    this.initToken(token);
    return token;
  }

  async getTokenByAddressAsync(tokenAddress: string): Promise<Token> {
    const token = new Token();
    token.address = tokenAddress;
    await this.initToken(token);
    return token;
  }

  private async initToken(token: Token): Promise<void> {
    token.balance = await this.getBalanceOf(token.address);
    token.name = await this.getName(token.address);
  }

  public async initTokenEventEmitter(token: Token, callback: Callback<EventLog>): Promise<EventEmitter> {
    // Setup the event in the contract object to get it to call 
    // "callback" each time the event is emitted by the contract.
    // Should be 3 lines of code
    
    // fromBlock is an option you can use to define from when to look.
    // Optional.  
    const fromBlock = this._web3Service.getLatestBlockNumber();
    return null;
  }

  async isValidErc20(contractAddress: string): Promise<boolean> {
    try {
      const contract = await this.getContract(contractAddress);
      if (!!contract) {
        const totalSupply = await contract.methods.totalSupply().call();
        if (totalSupply > 0) {
          return true;
        }
      }
    } catch (e) { }
    return false;
  }

  /**
   * Transfer an amount of a ERC20 token to another account
   * @param erc20Address The address of the token
   * @param privateKey The private key to sign from
   * @param to The address to transfer to
   * @param amount The amount to transfer
   */
  async transfer(erc20Address: string, privateKey: string, to: string, amount: number): Promise<TransactionReceipt> {
    // Make the transaction using the contract object. You do not need
    // the value of a transation: the value should be in the data, thus abi. 
    const receipt = null;
    return receipt;
  }

}

export class CreateERC20FromData {
  name: string;
  totalSupply: number;
}