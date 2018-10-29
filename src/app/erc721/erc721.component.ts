import { Component, OnInit } from '@angular/core';
import { DeploymentService } from '@services/deployment.service';
import { Observable } from 'rxjs';
import { Erc721Service, CreateErc721TokenFormData } from '@services/erc721.service';
import { Plot } from '@models/plot';


@Component({
  selector: 'app-erc721',
  templateUrl: './erc721.component.html',
  styleUrls: ['./erc721.component.css']
})
export class Erc721Component implements OnInit {

  private _addPlotFormData: CreateErc721TokenFormData;
  private _addPlotLoading = false;
  private _clibboardFailed = false;
  private _deployedContract = '';
  private _deploymentLoading = false;
  private _erc721Name = '';
  private _erc721Owner = '';
  private _plots: Observable<Plot[]>;

  constructor(
    private _deploymentService: DeploymentService,
    private _erc721Service: Erc721Service
  ) { }

  ngOnInit() {
    this.getPlots();
  }

  private closeAddPlot(): void {
    delete this._addPlotFormData;
  }

  private async deployClipboard() {
    try {
      this._deploymentLoading = true;
      // @ts-ignore
      this._deployedContract = await navigator.clipboard.readText().then(text => {
        const ret = this._deploymentService.deployContract([], text);
        return ret;
      });
      this._deploymentLoading = false;
    } catch (e) {
      alert('Invalid bin');
      this._deploymentLoading = false;
    }
  }

  private async getPlots(): Promise<void> {
    this._plots = this._erc721Service.getPlots();
  }

  private openAddPlot(): void {
    this._addPlotFormData = new CreateErc721TokenFormData();
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

