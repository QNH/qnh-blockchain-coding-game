import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { Erc20Component } from './erc20/erc20.component';
import { Web3Service } from '@services/web3.service';
import { Erc20Service } from '@services/erc20.service';
import { KeyService } from '@services/key.service';
import { IntroductionComponent } from './introduction/introduction.component';
import { AppRoutingModule } from './/app-routing.module';
import { ResetComponent } from './reset/reset.component';
import { RouteService } from '@services/route.service';
import { Part2ValidationService } from '@services/access/part2-validation.service';
import { Part3ValidationService } from '@services/access/part3-validation.service';
import { Part4ValidationService } from '@services/access/part4-validation.service';
import { Part5ValidationService } from '@services/access/part5-validation.service';


@NgModule({
  declarations: [
    AppComponent,
    Erc20Component,
    IntroductionComponent,
    ResetComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [Erc20Service, KeyService, RouteService, Web3Service,
  // Validation services
  Part2ValidationService, Part3ValidationService, Part4ValidationService, Part5ValidationService
],
  bootstrap: [AppComponent]
})
export class AppModule { }
