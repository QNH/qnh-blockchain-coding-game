import { Injectable } from '@angular/core';

@Injectable()
export class Part3ValidationService {

  constructor() { }

  canActivate(params, routeConfig, navigationInstruction) {
    return true;
  }

}
