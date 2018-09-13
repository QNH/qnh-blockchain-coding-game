import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { IntroductionComponent } from '@app/introduction/introduction.component';
import { Erc20Component } from '@app/erc20/erc20.component';
import { Web3Service } from '@services/web3.service';

const routes: Routes = [
  { path: '', component: IntroductionComponent, pathMatch: 'full' },
  { path: 'part2', component: Erc20Component, canActivate: [ Web3Service ] }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  declarations: [],
  exports: [ RouterModule ]
})
export class AppRoutingModule { }
