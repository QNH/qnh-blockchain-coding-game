import { Component, OnInit } from '@angular/core';
import { KeyService } from '@services/key.service';
import { Web3Service } from '@services/web3.service';
import { RouteService } from '@services/route.service';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  styleUrls: ['./introduction.component.css']
})
export class IntroductionComponent implements OnInit {

  private _nodeAddress = '';
  private _nodeAddressInvalid = false;
  private _privateKey = '';
  private _privateKeyInvalid = false;

  constructor(
    private _keyService: KeyService,
    private _routeService: RouteService,
    private _web3Service: Web3Service
  ) { }

  ngOnInit() {
  }

  private get needsNodeAddress(): boolean {
    return !this._web3Service.hasNodeAddress;
  }

  private async submit() {
    if (this.needsNodeAddress) {
      if (await this._web3Service.isValidNode(this._nodeAddress)) {
        this._nodeAddressInvalid = false;
        this._web3Service.setNodeAddress(this._nodeAddress);
      } else {
        this._nodeAddressInvalid = true;
      }
    }
    if (this._web3Service.hasNodeAddress) {
      if (await this._web3Service.isValidPrivateKey(this._privateKey)) {
        this._privateKeyInvalid = false;
        this._keyService.setPrivateKey(this._privateKey);
        this._routeService.navigateToPart2();
      } else {
        this._privateKeyInvalid = true;
      }
    }
  }

}
