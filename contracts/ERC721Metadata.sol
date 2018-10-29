pragma solidity ^0.4.24;

contract Erc721Metadata {
  string public name;
  string public symbol;
  string public tokenURI;

  constructor(string _name, string _symbol, string _tokenURI) public {
    name = _name;
    symbol = _symbol;
    tokenURI = _tokenURI;
  }

}
