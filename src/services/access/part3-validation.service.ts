import { Injectable } from '@angular/core';
import { Part2ValidationService } from './part2-validation.service';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';

@Injectable()
export class Part3ValidationService {

  private _erc721Address: string;
  private readonly Erc721ContractAddressKey = 'bcg_erc721_contract_address';

  private _erc721HasTokens = false;
  private readonly Erc721HasTokensKey = 'bcg_erc721_has_tokens';

  private _purchasedId = -1;
  private readonly PurchasedIdKey = 'bcg_erc721_purchased_id';

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

  public getErc721ContractAddress(): string {
    if (!this._erc721Address) {
      this._erc721Address = localStorage.getItem(this.Erc721ContractAddressKey);
    }
    return this._erc721Address;
  }

  public getErc721HasTokens(): boolean {
    return !!localStorage.getItem(this.Erc721HasTokensKey);
  }

  public hasDonePurchase(): boolean {
    if (this._purchasedId < 0) {
      const idString = localStorage.getItem(this.PurchasedIdKey);
      if (!!idString && !!idString.length) {
        try {
          this._purchasedId = parseInt(idString);
        } catch (e) {

        }
      }
    }
    return this._purchasedId >= 0;
  }

  public reset(): void {
    this.setErc721HasTokens(false);
    this.setErc721Address('');
    this.setPurchasedId(-1);
  }

  public setErc721Address(address: string): void {
    this._erc721Address = address;
    localStorage.setItem(this.Erc721ContractAddressKey, this._erc721Address);
  }

  public setErc721HasTokens(has: boolean) {
    this._erc721HasTokens = has;
    localStorage.setItem(this.Erc721HasTokensKey, this._erc721HasTokens + '');
  }

  public setPurchasedId(id: number) {
    if (id >= 0) {
      this._purchasedId = id;
      localStorage.setItem(this.PurchasedIdKey, this._purchasedId + '');
    } else {
      // Removed.
      delete this._purchasedId;
      localStorage.setItem(this.PurchasedIdKey, '');
    }
  }

}
