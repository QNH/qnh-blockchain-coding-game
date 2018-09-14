import { Component, OnInit } from '@angular/core';
import { KeyService } from '@services/key.service';
import { Web3Service } from '@services/web3.service';
import { Erc20Service } from '@services/erc20.service';
import { RouteService } from '@services/route.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {

  constructor(
    private _erc20Service: Erc20Service,
    private _keyService: KeyService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) { }

  reset() {
    this._erc20Service.reset();
    this._keyService.resetKey();
    this._web3Service.resetNodeAddress();
    this._routeService.navigateToReset();
  }

}
