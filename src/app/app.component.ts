import { Component } from '@angular/core';
import * as environment from '@environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private _menuItems: MenuItem[] = [
    { href: environment.environment.routes.part1, label: 'Task 1: Introduction' },
    { href: environment.environment.routes.part2, label: 'Task 2: ERC20 Token' },
    { href: environment.environment.routes.part3, label: 'Task 3: ERC721 Asset' },
    { href: environment.environment.routes.part4, label: 'Task 4: ???' },
    { href: environment.environment.routes.part5, label: 'Task 5: ???' },
  ];

  private shouldShowMenuItem(menuItem: MenuItem): boolean {
    return true;
  }
}


class MenuItem {
  href: string;
  label: string;
}
