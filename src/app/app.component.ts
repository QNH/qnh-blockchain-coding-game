import { Component } from '@angular/core';
import { MenuService, MenuItem } from '@services/menu.service';
import { Observable } from 'rxjs';
import { KeyService } from '@services/key.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _address: string;
  private _menuItems: Observable<MenuItem[]>;
  private _shouldShowMenu = false;

  constructor(
    private _menuService: MenuService,
    private _keyService: KeyService
  ) {
    this._menuItems = this._menuService.getMenuItems();
    this._shouldShowMenu = this._menuService.shouldShowMenu();
    this._menuItems.subscribe(() => {
      this._shouldShowMenu = this._menuService.shouldShowMenu();
    });
  }

  private getAddress(): string {
    if (!this._address || !this._address) {
      this._address = this._keyService.getAddress();
    }
    return this._address;
  }

  private hasAddress(): boolean {
    const address = this.getAddress();
    return !!address && !!address.length;
  }

  private isActive(menuItem: MenuItem): boolean {
    return this._menuService.isActive(menuItem);
  }
}

