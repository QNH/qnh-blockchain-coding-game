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
    let contract = await this._web3Service.getContract(abi);
    if (!binary || !binary.substr) {
      throw new Error('Invalid bin');
    } else if (binary.substr(0, 2) !== '0x') {
      binary = '0x' + binary;
    }
    const deployment = await contract.deploy({
      data: binary,
      arguments: args
    });
    if (!!deployment) {
      const trx = {
        from: this._web3Service.getAccountByPrivateKey(privateKey).address,
        gas: environment.gas,
        chainId: environment.chainId
      };
      const gasEstimate = await deployment.estimateGas(trx);
      console.log('Gas estimate for contract deployment: ' + gasEstimate);
      if (gasEstimate > 0) {
        contract = await deployment.send(trx);
        if (!!contract &&
          !!contract.options &&
          !!contract.options.address) {
            return contract.options.address;
          }
      }
    }
    return null;
  }

}
