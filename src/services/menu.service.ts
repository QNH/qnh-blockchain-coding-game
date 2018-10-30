import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Part3ValidationService } from './access/part3-validation.service';
import { Part2ValidationService } from './access/part2-validation.service';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable()
export class MenuService {
  private readonly TEMPLATE: MenuItem[] = [
    {
      href: environment.routes.part1,
      label: 'Task 1: Introduction',
      shouldShow: (): boolean => true
    },
    {
      href: environment.routes.part2,
      label: 'Task 2: ERC20 Token',
      shouldShow: (): boolean => this._part2ValidationService.canActivate(false)
    },
    {
      href: environment.routes.part3,
      label: 'Task 3: ERC721 Asset',
      shouldShow: (): boolean => this._part2ValidationService.partComplete
    },
    {
      href: environment.routes.part4,
      label: 'Task 4: ???',
      shouldShow: (): boolean => false
    },
    {
      href: environment.routes.part5,
      label: 'Task 5: ???',
      shouldShow: (): boolean => false
    },
  ];

  private _menuItems: BehaviorSubject<MenuItem[]>;

  public constructor(
    private _part2ValidationService: Part2ValidationService,
    private _part3ValidationService: Part3ValidationService,
    private _router: Router
  ) { }

  public getMenuItems(): Observable<MenuItem[]> {
    if (!this._menuItems) {
      this._menuItems = new BehaviorSubject([]);
      this.syncMenuItems();
    }
    return this._menuItems.asObservable();
  }

  public isActive(menuItem: MenuItem): boolean {
    return this._router.url.endsWith(menuItem.href);
  }

  public shouldShowMenu(): boolean {
    const shownItems = this._menuItems.getValue().length;
    return shownItems > 1;
  }

  private shouldShowMenuItem(menuItem: MenuItem): boolean {
    return menuItem.shouldShow();
  }

  /**
   * Update the visibility of the menu items. Any Observable from
   * _menuService.getMenuItems() will automatically be updated,
   * but for event reasons, a boolean is returned
   * @returns boolean True if there was a change in visibility,
   * false if not and the items stayed the same.
   */
  public syncMenuItems(): boolean {
    let changed = false;
    const currentItems = this._menuItems.getValue();
    const newItems = this.TEMPLATE.filter(menuItem => menuItem.shouldShow());
    if (newItems.length !== currentItems.length) {
      changed = true;
    }
    if (changed) {
      this._menuItems.next(newItems);
    }
    return changed;
  }
}
export class MenuItem {
  href: string;
  label: string;
  shouldShow: Function;
}
