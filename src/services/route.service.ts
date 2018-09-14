import { Injectable } from '@angular/core';
import * as environment from '@environments/environment';
import { Router } from '@angular/router';

@Injectable()
export class RouteService {
  private _routes = environment.environment.routes;

  constructor(
    private _router: Router
  ) { }

  navigateToPart1(): void {
    this._router.navigateByUrl('/' + this._routes.part1);
  }

  navigateToPart2(): void {
    this._router.navigateByUrl('/' + this._routes.part2);
  }

  navigateToPart3(): void {
    this._router.navigateByUrl('/' + this._routes.part3);
  }

  navigateToPart4(): void {
    this._router.navigateByUrl('/' + this._routes.part4);
  }

  navigateToPart5(): void {
    this._router.navigateByUrl('/' + this._routes.part5);
  }

  navigateToReset(): void {
    this._router.navigateByUrl('/' + this._routes.reset);
  }

}
