import { Injectable } from '@angular/core';
import { TransactionReceipt } from 'web3/types';
import { Web3Service } from './web3.service';
import { environment } from '@environments/environment';
import { KeyService } from './key.service';

@Injectable()
export class DeploymentService {

  constructor(
    private _keyService: KeyService,
    private _web3Service: Web3Service
  ) { }


  /**
   * Deploy a contract, based on binary.
   * @param binary The binary of the contract
   * @param privateKey The private key to sign the transaction with
   */
  async deployContract(
    abi: any[],
    binary: string,
    args: any[] = [],
    privateKey: string = this._keyService.getPrivateKey()):
  Promise<string> {
    const contract = await this._web3Service.getContract(abi);
    // Helping with the binary a bit ;)
    if (!binary || !binary.substr) {
      throw new Error('Invalid bin');
    } else if (binary.substr(0, 2) !== '0x') {
      binary = '0x' + binary;
    }
    // This is where a contract should be deployed. 
    // Should be around 20 (neat) lines or 6 (less-neat) lines
    return null;
  }

}
