import { Component } from '@angular/core';
import { MenuService, MenuItem } from '@services/menu.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _menuItems: Observable<MenuItem[]>;
  private _shouldShowMenu = false;

  constructor(
    private _menuService: MenuService
  ) {
    this._menuItems = this._menuService.getMenuItems();
    this._shouldShowMenu = this._menuService.shouldShowMenu();
    this._menuItems.subscribe(() => {
      this._shouldShowMenu = this._menuService.shouldShowMenu();
    });
  }

  private isActive(menuItem: MenuItem): boolean {
    return this._menuService.isActive(menuItem);
  }
}

