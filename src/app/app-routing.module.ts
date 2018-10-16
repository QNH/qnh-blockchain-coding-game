import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import * as environment from '@environments/environment';
import { IntroductionComponent } from '@app/introduction/introduction.component';
import { Erc20Component } from '@app/erc20/erc20.component';
import { ResetComponent } from '@app/reset/reset.component';

// Access Services
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { Part3ValidationService } from '@services/access/part3-validation.service';
import { Part4ValidationService } from '@services/access/part4-validation.service';
import { Part5ValidationService } from '@services/access/part5-validation.service';
import { Erc721Component } from './erc721/erc721.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: environment.environment.routes.part1 },
  { path: environment.environment.routes.part1, component: IntroductionComponent, pathMatch: 'full' },
  { path: environment.environment.routes.part2, component: Erc20Component, canActivate: [Part2ValidationService] },
  { path: environment.environment.routes.part3, component: Erc721Component, canActivate: [Part3ValidationService] },
  { path: environment.environment.routes.reset, component: ResetComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [RouterModule]
})
export class AppRoutingModule { }
