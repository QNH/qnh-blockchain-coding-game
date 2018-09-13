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


@NgModule({
  declarations: [
    AppComponent,
    Erc20Component,
    IntroductionComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [Erc20Service, KeyService, Web3Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
