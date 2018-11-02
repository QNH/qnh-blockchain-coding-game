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
    // First get the Javascript Definition of the contract, via the Abstract Binary Interface (ABI)
    // and the address of the contract. Note that there is NO VALIDATION on whether the contract
    // matches the given ABI, meaning you cannot check if the address does match the ABI.
    // The getContract method is defined below for reusable code. You will use this method a lot.
    const contract = await this.getContract(erc20Address);

    // Next, get the declerations of the methods in the contract ABI. Still no exceptions if the
    // ABI does not match the one at the contract address.
    const methods = contract.methods;

    // Make a definition of the method you want to execute.
    const method = methods.balanceOf(accountAddress);

    // Make the (asynchronous) call to the Ethereum node. If the ABI does not match the bytecode at the address,
    // you will receive an error here, defining it cannot make BigInteger object from the response.
    // So if the ABI defined that the response was a string, it would only give you an empty string.
    const balance = await method.call();
    return balance;
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
    const contract = await this.getContract(erc20Address);
    const bytes = await contract.methods.name().call();
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
    const fromBlock = this._web3Service.getLatestBlockNumber();
    // First, again, get the contract.
    const tokenContract = await this.getContract(token.address);

    // Next, add a callback to the Transfer event in the smart contract
    return tokenContract.events.allEvents({fromBlock: await this._web3Service.getLatestBlockNumber() }, callback);
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
    return receipt;
  }

}

export class CreateERC20FromData {
  name: string;
  totalSupply: number;
}