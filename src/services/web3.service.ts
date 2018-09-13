import { Injectable } from '@angular/core';
import * as environment from '@environments/environment';
// @ts-ignore
import * as Web3 from 'web3';
import { isUndefined } from 'util';
import { TransactionReceipt } from 'web3/types';
import Contract from 'web3/eth/contract';

@Injectable()
export class Web3Service {

  private _web3: Web3;

  constructor() {
    this.checkConnection();
  }

  private async checkConnection() {
    try {
      if (
        isUndefined(this._web3)
        ||
        isUndefined(this._web3.eth)
        ||
        isUndefined(this._web3.eth.net)
        ||
        !await this._web3.eth.net.isListening()) {
        // @ts-ignore
        this.web3 = new Web3(environment.web3ConnectionString);
      }
    } catch (error) {
      // @ts-ignore
      this.web3 = new Web3(environment.web3ConnectionString);
    }
  }

  /**
   * Get the contract object of an abi
   * @param abi The abi of the contract
   * @param address The address of the contract. Can be left empty
   * for reasons
   */
  getContract(abi: any[], address: string = null): Contract {
    return new this._web3.eth.Contract(abi, address);
  }

  /**
   *
   * @param transaction The transaction to be signed and sent
   * @param privateKey The private key to sign with
   */
  async sendTransaction(transaction: Object, privateKey: string): Promise<TransactionReceipt> {
    await this.checkConnection();
    const signature = await this._web3.eth.accounts.signTransaction(transaction, privateKey);
    if (!!signature) {
      return await this._web3.eth.sendSignedTransaction(signature as string);
    } else {
      return null;
    }
  }

}
