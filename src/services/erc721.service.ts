import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as Erc721Metadata from '@contracts/erc721-metadata';
import { Plot } from '@models/plot';
import Contract from 'web3/eth/contract';
import { Web3Service } from './web3.service';
import { environment } from '@environments/environment';
import { KeyService } from './key.service';
import { DeploymentService } from './deployment.service';
import { Part4ValidationService } from '@services/access/part4-validation.service';
import { TransactionReceipt, EventEmitter } from 'web3/types';

@Injectable()
export class Erc721Service {

  private _erc721Subject: BehaviorSubject<Plot[]>;
  private _plotAddress: string;

  constructor(
    private _deploymentService: DeploymentService,
    private _keyService: KeyService,
    private _part3ValidatorService: Part4ValidationService,
    private _web3Service: Web3Service
  ) { }

  async createPlot(plot: CreateErc721TokenFormData): Promise<void> {
    // These two lines are to deploy a metadatacontract for the Bonus
    const metadataAbi = Erc721Metadata.abi;
    const metadataBin = Erc721Metadata.bin;
    let contract: Contract, transaction: Object, metadataAddress = '0x0';
    if (!!plot.name || plot.symbol || plot.url) {
      // deploy Metadata
      metadataAddress = await this._deploymentService.deployContract(metadataAbi, metadataBin, [
        plot.name,
        plot.symbol,
        plot.url
      ]);
    }
    contract = await this.getContract(this._plotAddress);
    transaction = {
      chainId: environment.chainId,
      gas: environment.gas,
      gasPrice: environment.gasPrice,
      from: this._keyService.getAddress(),
      to: this._plotAddress,
      data: contract.methods.createToken(plot.price, metadataAddress).encodeABI()
    };
    const receipt = await this._web3Service.sendTransaction(transaction, this._keyService.getPrivateKey());
    return;
  }

  /**
   * Deploy an ERC-721 contract with a given binary.
   * @param binary The contract binary, found in
   * qnh-blockchain-coding-game/contracts/build/ERC721_sol_ERC721.bin,
   * if all is done well.
   * @returns The address of the contract
   */
  public async deployErc721Contract(): Promise<string> {
    const erc721Contract = require('@contracts/erc721.json');
    return await this._deploymentService.deployContract(erc721Contract.abi, erc721Contract.bin);
  }

  private async getContract(address: string): Promise<Contract> {
    const erc721Contract = require('@contracts/erc721.json');
    return this._web3Service.getContract(erc721Contract.abi, address);
  }

  private async getMetadataContract(address: string): Promise<Contract> {
    return this._web3Service.getContract(Erc721Metadata.abi, address);
  }

  getPlots(): Observable<Plot[]> {
    if (!this._erc721Subject) {
      this._erc721Subject = new BehaviorSubject<Plot[]>([]);
    }
    if (!!this._plotAddress) {
      this.synchronizePlots();
      this.getContract(this._plotAddress).then(async (contract) => {
        const currentBlock = await this._web3Service.getLatestBlockNumber();
        contract.events.allEvents({ fromBlock: currentBlock }, (eventLog) => {
          this.synchronizePlots();
        });
      });
    }
    return this._erc721Subject.asObservable();
  }

  public hasContractAddress(): boolean {
    const address = this.getPlotAddress();
    return !!address && !!address.length;
  }

  public getPlotAddress(): string {
    if (!this._plotAddress || !this._plotAddress.length) {
      this._plotAddress = this._part3ValidatorService.getErc721ContractAddress();
    }
    return !!this._plotAddress ?
      this._plotAddress : undefined;
  }

  async purchasePlot(plot: Plot): Promise<TransactionReceipt|false> {
    if (!this._plotAddress) {
      console.error('No contract for plot is set!');
      return false;
    }
    const contract = await this.getContract(this._plotAddress);
    const price = await contract.methods.tokenPrices(plot.id).call();
    const abi = contract.methods.purchase(plot.id).encodeABI();
    const transaction = {
      chainId: environment.chainId,
      from: this._keyService.getAddress(),
      to: this._plotAddress,
      value: price,
      data: abi,
      gas: environment.gas
    };
    const receipt = await this._web3Service.sendTransaction(transaction, this._keyService.getPrivateKey());
    if (!this._part3ValidatorService.hasDonePurchase()) {
      this._part3ValidatorService.setPurchasedId(plot.id);
    }
    return receipt;
  }

  reset(): void {
    delete this._plotAddress;
    delete this._erc721Subject;
  }

  public setContractAddress(address: string): void {
    this._plotAddress = address;
    this._part3ValidatorService.setErc721Address(address);
    this._erc721Subject.next([]);
    this.synchronizePlots();
  }

  async synchronizePlots(): Promise<void> {
    if (!!this._plotAddress) {
      const contract = await this.getContract(this._plotAddress);
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
          plot.symbol = await metadata.methods.symbol().call();
        }
        plot.price = await contract.methods.tokenPrices(id).call();
        plot.ownerAddress = await contract.methods.tokens(id).call();
        list.push(plot);
      }
      if (!this._part3ValidatorService.getErc721HasTokens() && list.length > 0) {
        this._part3ValidatorService.setErc721HasTokens(true);
      }
      this._erc721Subject.next(list);
    } else {
      if (this._erc721Subject.getValue().length > 0) {
        this._erc721Subject.next([]);
      }
    }
  }

}

export class CreateErc721TokenFormData {
  name = '';
  price = 0;
  symbol = '';
  url = '';
}
