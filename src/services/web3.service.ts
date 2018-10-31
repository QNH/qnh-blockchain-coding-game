import { Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3/types';
import Web3 from 'web3';
import Contract from 'web3/eth/contract';
import { Account } from 'web3/eth/accounts';
import { CanActivate } from '@angular/router';
import { environment } from '@environments/environment';

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
      // @ts-ignore
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

  /**
   *Get the Ether balance of an account
   *
   * @param string The address of the account to check the Ether balance of
   * @returns The Ether balance in Wei
   * @memberof Web3Service
   */
  public async getEtherBalance(address: string): Promise<number> {
    // Number of expected lines: 1
    return this.web3.eth.getBalance(address);
  }

  async getLatestBlockNumber(): Promise<number> {
    return this.web3.eth.getBlockNumber();
  }

  async getTransactionReceipt(transactionHash: string): Promise<TransactionReceipt> {
    return await this.web3.eth.getTransactionReceipt(transactionHash);
  }

  get hasNodeAddress(): boolean {
    return !!this.nodeAddress;
  }

  isNullOrInvalidAddress(address: string): boolean {
    if (!address || !address.length || address.length !== 42) {
      console.log('invalid length: ' + address);
      return false;
    }
    try {
      const bigNumber = this.web3.utils.toBN(address);
      return bigNumber.eqn(0);
    } catch (e) {
      // Not a valid address
      return true;
    }
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
    // Must use web3.eth.accounts.signTransaction
    // Can not use web3.eth.signTranscation
    const signature = await this.web3.eth.accounts.signTransaction(transaction, privateKey);

    // signature can be an object or a string.
    let rawTransaction: string;
    if (typeof (signature) === 'string') {
      rawTransaction = signature;
    } else {
      // @ts-ignore
      rawTransaction = signature.rawTransaction;
    }

    if (!!signature) {
      // Send signed transaction
      return await this.web3.eth.sendSignedTransaction(rawTransaction);
    } else {
      return null;
    }
  }

  setNodeAddress(nodeAddress: string) {
    this._nodeAddress = nodeAddress;
    localStorage.setItem(this.nodeAddressStorageKey, this._nodeAddress);
  }

  public async transferEther(from: string, to: string, amount: number, privateKey: string): Promise<TransactionReceipt> {
    const nonce = await this.web3.eth.getTransactionCount(from);
    const transaction = {
      from: from,
      to: to,
      amount: amount,
      nonce: nonce,
      gas: environment.gas,
      gasPrice: environment.gasPrice,
      chainId: environment.chainId
    };
    // sendTransaction needs more help in order to actually sign the transation.
    // If using Visual Studio Code, ctrl-click on sendTransaction below will
    // direct you to the declaration of the method
    return this.sendTransaction(transaction, privateKey);
  }

}
