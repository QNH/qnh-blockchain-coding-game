import { EventEmitter } from 'web3/types';

export class Token {
  constructor() {
  }

  address: string;
  balance: string;
  decimals = 18;
  eventEmitter: EventEmitter;
  name: string;

}
