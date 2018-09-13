import { Component, OnInit, OnDestroy } from '@angular/core';
import { Erc20Service } from '@services/erc20.service';
import { Observable } from 'rxjs/Observable';
import { Token } from '@models/token';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-erc20',
  templateUrl: './erc20.component.html',
  styleUrls: ['./erc20.component.css']
})
export class Erc20Component implements OnInit, OnDestroy {

  private _newTokenAddress = '';
  private _tokens: Token[] = [];
  private _tokenSubscriptions: Subscription;

  constructor(
    private _erc20Service: Erc20Service
  ) {
  }

  private addToken() {
    if (!this._erc20Service.hasTokenWithAddress(this._newTokenAddress)) {
      const token = new Token();
      token.address = this._newTokenAddress;
      this._erc20Service.addToken(token);
      this._newTokenAddress = '';
    }
  }

  ngOnDestroy() {
    if (!!this._tokenSubscriptions && !this._tokenSubscriptions.closed) {
      this._tokenSubscriptions.unsubscribe();
    }
  }

  ngOnInit() {
    this._tokenSubscriptions = this._erc20Service.getTokens().subscribe((tokens) => {
      this._tokens = tokens;
    });
  }



}
