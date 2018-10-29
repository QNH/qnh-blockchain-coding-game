import { Component } from '@angular/core';
import * as environment from '@environments/environment';
import { Router } from '@angular/router';
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { Part3ValidationService } from '@services/access/part3-validation.service';
import { KeyService } from '@services/key.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _menuItems: MenuItem[] = [
    { href: environment.environment.routes.part1, label: 'Task 1: Introduction', shouldShow: true },
    { href: environment.environment.routes.part2, label: 'Task 2: ERC20 Token', shouldShow: this._part2ValidationService.canActivate(false) },
    { href: environment.environment.routes.part3, label: 'Task 3: ERC721 Asset', shouldShow: this._part2ValidationService.partComplete },
    { href: environment.environment.routes.part4, label: 'Task 4: ???', shouldShow: false },
    { href: environment.environment.routes.part5, label: 'Task 5: ???', shouldShow: false },
  ];

  constructor(
    private _keyService: KeyService,
    private _part2ValidationService: Part2ValidationService,
    private _part3ValidationService: Part3ValidationService,
    private _router: Router
  ) {}

  private isActive(menuItem: MenuItem): boolean {
    return this._router.url.endsWith(menuItem.href);
  }

  private shouldShowMenu(): boolean {
    const shownItems = this._menuItems.filter(menuItem => {
      return menuItem.shouldShow;
    }).length;
    return shownItems > 1;
  }

  private shouldShowMenuItem(menuItem: MenuItem): boolean {
    return menuItem.shouldShow;
  }
}


class MenuItem {
  href: string;
  label: string;
  shouldShow: boolean;
}
