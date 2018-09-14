import { Injectable } from '@angular/core';
// @ts-ignore
import * as Web3 from 'web3';
import { TransactionReceipt } from 'web3/types';
import Contract from 'web3/eth/contract';
import { Account } from 'web3/eth/accounts';
import { CanActivate } from '@angular/router';

@Injectable()
export class Web3Service {
  private readonly nodeAddressStorageKey = 'bcg-node-address';

  private _nodeAddress: string;
  private _web3: Web3;

  constructor() { }

  private get web3(): Web3 {
    if (!this.hasNodeAddress) {
      const nodeAddress = localStorage.getItem(this.nodeAddressStorageKey);
      if (!!nodeAddress) {
        this._nodeAddress = nodeAddress;
      } else {
        return null;
      }
    }
    if (!this._web3 || !this._web3.eth) {
      this._web3 = new Web3(this._nodeAddress);
    }
    return this._web3;
  }

  getAccountByPrivateKey(privateKey: string): Account {
    try {
      return this.web3.eth.accounts.privateKeyToAccount(privateKey);
    } catch (e) {
      return null;
    }
  }

  /**
   * Get the contract object of an abi
   * @param abi The abi of the contract
   * @param address The address of the contract. Can be left empty
   * for reasons
   */
  async getContract(abi: any[], address: string = null): Promise<Contract> {
    return new this.web3.eth.Contract(abi, address);
  }

  get hasNodeAddress(): boolean {
    return !!this.nodeAddress;
  }

  async isValidNode(nodeAddress: string): Promise<boolean> {
    try {
      const web3 = new Web3(nodeAddress);
      if (!!web3 && !!web3.eth.currentProvider) {
        const blockNumber = await web3.eth.getBlockNumber().catch(() => {
          return 0;
        });
        return blockNumber > 0;
      }
    } catch (e) { }
    return false;
  }

  /**
   * Checks if a private key is valid
   * @param privateKey The private key to be checked
   * @returns True if valid, false if not.
   */
  isValidPrivateKey(privateKey: string): boolean {
    try {
      const account = this.web3.eth.accounts.privateKeyToAccount(privateKey);
      if (!!account && !!account.address) {
        return true;
      }
    } catch (e) { }
    return false;
  }

  get nodeAddress(): string {
    if (!this._nodeAddress || !this._nodeAddress.length) {
      const nodeAddress = localStorage.getItem(this.nodeAddressStorageKey);
      if (!!nodeAddress) {
        this._nodeAddress = nodeAddress;
      } else {
        return null;
      }
    }
    return this._nodeAddress;
  }

  /**
   * Reset the node address of the app
   */
  resetNodeAddress(): void {
    this._nodeAddress = '';
    localStorage.setItem(this.nodeAddressStorageKey, '');
  }

  /**
   *
   * @param transaction The transaction to be signed and sent
   * @param privateKey The private key to sign with
   */
  async sendTransaction(transaction: Object, privateKey: string): Promise<TransactionReceipt> {
    const signature = await this.web3.eth.accounts.signTransaction(transaction, privateKey);
    if (!!signature) {
      return await this.web3.eth.sendSignedTransaction(signature as string);
    } else {
      return null;
    }
  }

  setNodeAddress(nodeAddress: string) {
    this._nodeAddress = nodeAddress;
    localStorage.setItem(this.nodeAddressStorageKey, this._nodeAddress);
  }

}
