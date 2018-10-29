import { Injectable } from '@angular/core';
import { Part2ValidationService } from './part2-validation.service';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Injectable()
export class Part3ValidationService {

  constructor(
    private _part2ValidationService: Part2ValidationService,
    private _router: Router
  ) { }

  canActivate(params, routeConfig, navigationInstruction) {
    const part2Complete = this._part2ValidationService.partComplete;
    if (part2Complete) {
      return true;
    } else {
      this._router.navigateByUrl(environment.routes.part1);
    }
  }

}
