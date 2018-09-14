import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Web3Service } from '@services/web3.service';
import { KeyService } from '@services/key.service';
import { RouteService } from '@services/route.service';

@Injectable()
export class Part2ValidationService implements CanActivate {

  constructor(
    private _keyService: KeyService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) { }

  canActivate(): boolean {
    if (this._keyService.isPrivateKeySet && this._web3Service.hasNodeAddress) {
      return true;
    } else {
      this._routeService.navigateToPart1();
    }
  }

}
