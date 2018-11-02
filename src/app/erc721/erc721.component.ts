import { Component, OnInit } from '@angular/core';
import { DeploymentService } from '@services/deployment.service';
import { Observable } from 'rxjs';
import { Erc721Service, CreateErc721TokenFormData } from '@services/erc721.service';
import { Plot } from '@models/plot';
import { Part4ValidationService } from '@services/access/part4-validation.service';
import { RouteService } from '@services/route.service';
import { MenuService } from '@services/menu.service';


@Component({
  selector: 'app-erc721',
  templateUrl: './erc721.component.html',
  styleUrls: ['./erc721.component.css']
})
export class Erc721Component implements OnInit {

  private _addPlotError = '';
  private _addPlotFormData: CreateErc721TokenFormData;
  private _addPlotLoading = false;
  private _clibboardFailed = false;
  private _deploymentLoading = false;
  private _erc721Address: string;
  private _erc721Name = '';
  private _erc721Owner = '';
  private _plots: Observable<Plot[]>;
  private _puchaseLoading = false;

  constructor(
    private _deploymentService: DeploymentService,
    private _erc721Service: Erc721Service,
    private _menuService: MenuService,
    private _routeService: RouteService,
    private _validationService: Part4ValidationService
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

  private async deployErc721() {
    this._deploymentLoading = true;
    let erc721Address
    try {
      erc721Address = await this._erc721Service.deployErc721Contract();
      if (!!erc721Address) {
        this._erc721Address = erc721Address;
        this._erc721Service.setContractAddress(erc721Address);
      }
    } catch (e) {
      console.error(e);
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
    if (!this._puchaseLoading) {
      this._puchaseLoading = true;
      const donePurchaseBefore = this._validationService.hasDonePurchase();
      const receipt = await this._erc721Service.purchasePlot(plot);
      if (receipt !== false && !!receipt.status) {
        this._puchaseLoading = false;
        this._erc721Service.synchronizePlots();
        if (!donePurchaseBefore) {
          this._menuService.syncMenuItems();
          this._routeService.navigateToPart5();
        }
      } else {
        alert('Failure');
        this._puchaseLoading = false;
      }
    }
  }

  private async submitAddPlot(plot: CreateErc721TokenFormData): Promise<void> {
    if (!this._addPlotLoading) {
      this._addPlotLoading = true;
      this._erc721Service.createPlot(plot).then(() => {
        this._erc721Service.synchronizePlots();
        this._addPlotLoading = false;
        this.closeAddPlot();
      }).catch(error => {
        console.error(error);
        this._addPlotLoading = false;
      });
    }
  }

}

