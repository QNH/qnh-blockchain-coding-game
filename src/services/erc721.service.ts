import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Erc721Contract from '@contracts/erc721';
import * as Erc721Metadata from '@contracts/erc721-metadata';
import { Plot } from '@models/plot';
import Contract from 'web3/eth/contract';
import { Web3Service } from './web3.service';
import { environment } from '@environments/environment';
import { KeyService } from './key.service';
import { DeploymentService } from './deployment.service';

@Injectable()
export class Erc721Service {

  private _erc721Subject: BehaviorSubject<Plot[]> = undefined;
  private _plotContract = '0x124056abaAf97d64BA1a0ccE5d226Ffc0b7BB4A3';

  constructor(
    private _deploymentService: DeploymentService,
    private _keyService: KeyService,
    private _web3Service: Web3Service
  ) { }

  async createPlot(plot: CreateErc721TokenFormData): Promise<void> {
    let contract: Contract, transaction: Object, metadataAddress = '0x0';
    if (!!plot.name || plot.symbol || plot.url) {
      // deploy Metadata
      metadataAddress = await this._deploymentService.deployContract(Erc721Metadata.abi, Erc721Metadata.bin, [
        plot.name,
        plot.symbol,
        plot.url
      ]);
    }
    contract = await this.getContract(this._plotContract);
    transaction = {
      chainId: environment.chainId,
      gas: environment.gas,
      from: this._keyService.getAddress(),
      to: contract.options.address,
      data: contract.methods.createToken(plot.price, metadataAddress).encodeABI()
    };
    const receipt = await this._web3Service.sendTransaction(transaction, this._keyService.getPrivateKey());
    return;
  }

  private async getContract(address: string): Promise<Contract> {
    return this._web3Service.getContract(Erc721Contract.abi, address);
  }

  private async getMetadataContract(address: string): Promise<Contract> {
    return this._web3Service.getContract(Erc721Metadata.abi, address);
  }

  getPlots(): Observable<Plot[]> {
    if (!this._erc721Subject) {
      this._erc721Subject = new BehaviorSubject<Plot[]>([]);
      this.synchronizePlots();
      this.getContract(this._plotContract).then(async (contract) => {
        const currentBlock = await this._web3Service.getLatestBlockNumber();
        contract.events.allEvents({fromBlock: currentBlock}, (eventLog) => {
          this.synchronizePlots();
        });
      });
    }
    return this._erc721Subject.asObservable();
  }

  async synchronizePlots(): Promise<void> {
    const contract = await this.getContract(this._plotContract);
    const totalSupply = await contract.methods.totalSupply().call();
    const list = [];
    for (let id = 0; id < totalSupply; id++) {
      const plot = new Plot();
      plot.id = id;
      const metadataAddress = await contract.methods.metadata(id).call();
      if (!this._web3Service.isNullOrInvalidAddress(metadataAddress)) {
        plot.metadataAddress = metadataAddress;
        const metadata = await this.getMetadataContract(plot.metadataAddress);
        plot.name = await metadata.methods.name().call();
      }
      plot.price = await contract.methods.tokenPrices(id).call();
      plot.ownerAddress = await contract.methods.tokens(id).call();
      list.push(plot);
    }
    this._erc721Subject.next(list);
  }

}

export class CreateErc721TokenFormData {
  name = '';
  price = 0;
  symbol = '';
  url = '';
}
