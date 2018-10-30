import { Component, OnInit } from '@angular/core';
import { DeploymentService } from '@services/deployment.service';
import { Observable } from 'rxjs';
import { Erc721Service, CreateErc721TokenFormData } from '@services/erc721.service';
import { Plot } from '@models/plot';
import { Part3ValidationService } from '@services/access/part3-validation.service';


@Component({
  selector: 'app-erc721',
  templateUrl: './erc721.component.html',
  styleUrls: ['./erc721.component.css']
})
export class Erc721Component implements OnInit {

  private _addPlotFormData: CreateErc721TokenFormData;
  private _addPlotLoading = false;
  private _clibboardFailed = false;
  private _deploymentLoading = false;
  private _erc721Address: string;
  private _erc721Name = '';
  private _erc721Owner = '';
  private _plots: Observable<Plot[]>;

  constructor(
    private _deploymentService: DeploymentService,
    private _erc721Service: Erc721Service,
    private _validationService: Part3ValidationService
  ) { }

  ngOnInit() {
    this.getContractAddress();
    this.getPlots();
  }

  private closeAddPlot(): void {
    if (!this._addPlotLoading) {
      delete this._addPlotFormData;
    }
  }

  private async deployClipboard() {
    this._deploymentLoading = true;
    // @ts-ignore
    const erc721Address = await navigator.clipboard.readText().then(async text => {
      const ret = await this._erc721Service.deployErc721Contract(text);
      return ret;
    });
    if (!!erc721Address) {
      this._erc721Address = erc721Address;
      this._erc721Service.setContractAddress(erc721Address);
    }
    this._deploymentLoading = false;

  }

  private getContractAddress(): void {
    this._erc721Address = this._erc721Service.getPlotAddress();
  }

  private async getPlots(): Promise<void> {
    this._plots = this._erc721Service.getPlots();
  }

  private hasErc721Contract(): boolean {
    return this._erc721Service.hasContractAddress();
  }

  private hasCreatedErc721Token(): boolean {
    return this._validationService.getErc721HasTokens();
  }

  private hasPurchasedErc721Token(): boolean {
    return this._validationService.hasDonePurchase();
  }

  private openAddPlot(): void {
    this._addPlotFormData = new CreateErc721TokenFormData();
  }

  private plotForSale(plot: Plot): boolean {
    return (plot.price > 0);
  }

  private async purchasePlot(plot: Plot): Promise<void> {
    const receipt = await this._erc721Service.purchasePlot(plot);
    if (receipt !== false && !!receipt.status) {
      alert('Success!');
      this._erc721Service.synchronizePlots();
    } else {
      alert('Failure');
    }
  }

  private async submitAddPlot(plot: CreateErc721TokenFormData): Promise<void> {
    this._addPlotLoading = true;
    this._erc721Service.createPlot(plot).then(() => {
      this.closeAddPlot();
      this._addPlotLoading = false;
    }).catch(error => {
      console.error(error);
      this.closeAddPlot();
      this._addPlotLoading = false;
    });
  }

}

