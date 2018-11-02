import { Component, OnInit } from '@angular/core';
import { KeyService } from '@services/key.service';
import { Web3Service } from '@services/web3.service';
import { Erc20Service } from '@services/erc20.service';
import { RouteService } from '@services/route.service';
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { Erc721Service } from '@services/erc721.service';
import { Part4ValidationService } from '@services/access/part4-validation.service';
import { MenuService } from '@services/menu.service';
import { Part3ValidationService } from '@services/access/part3-validation.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent {

  constructor(
    private _erc20Service: Erc20Service,
    private _erc721Service: Erc721Service,
    private _keyService: KeyService,
    private _menuService: MenuService,
    private _part2ValidationService: Part2ValidationService,
    private _part3ValidationService: Part3ValidationService,
    private _part4ValidationService: Part4ValidationService,
    private _routeService: RouteService,
    private _web3Service: Web3Service,
  ) { }

  reset() {
    this._part2ValidationService.reset();
    this._part3ValidationService.reset();
    this._part4ValidationService.reset();
    this._erc721Service.reset();
    this._keyService.resetKey();
    this._web3Service.resetNodeAddress();

    // After all resetting, update frontends.
this._menuService.syncMenuItems();
    this._routeService.navigateToPart1();
  }

}
