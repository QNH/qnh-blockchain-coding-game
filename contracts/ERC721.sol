pragma solidity ^0.4.20;

/// @title ERC-721 Non-Fungible Token Standard
/// @dev See https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md
///  Note: the ERC-165 identifier for this interface is 0x80ac58cd.
contract ERC721 /* is ERC165 */ {

  mapping(address => mapping (uint256 => address)) allowed;
  mapping(address => mapping (address => bool)) allowedForAll;
  mapping(uint256 => address) public metadata;
  address owner = msg.sender;
  mapping(address => uint256) public tokenBalances;
  mapping(uint256 => uint256) public tokenPrices;
  mapping(uint256 => address) public tokens;
  uint256 public totalSupply = 0;

  modifier requireNotNull(address _operator) {
    require (_operator != address(0), "Address is 0-address");
    _;
  }

  modifier validateOperator(address _operator, uint256 _tokenId) {
    require(this.ownerOf(_tokenId) == _operator, "Operator is no owner of token");
    _;
  }

  modifier validateToken(uint256 _tokenId) {
    require (tokens[_tokenId] != address(0), "Token does not exist");
    _;
  }

  /// ERC721 required or optional parts

  /// @dev This emits when ownership of any NFT changes by any mechanism.
  ///  This event emits when NFTs are created (`from` == 0) and destroyed
  ///  (`to` == 0). Exception: during contract creation, any number of NFTs
  ///  may be created and assigned without emitting Transfer. At the time of
  ///  any transfer, the approved address for that NFT (if any) is reset to none.
  event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);

  /// @dev This emits when the approved address for an NFT is changed or
  ///  reaffirmed. The zero address indicates there is no approved address.
  ///  When a Transfer event emits, this also indicates that the approved
  ///  address for that NFT (if any) is reset to none.
  event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);

  /// @dev This emits when an operator is enabled or disabled for an owner.
  ///  The operator can manage all NFTs of the owner.
  event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

  event PlotForSale(uint256 indexed _tokenId, uint256 _price);

  event PlotPurchased(uint indexed _tokenId, uint256 _price);

  /// @notice Change or reaffirm the approved address for an NFT
  /// @dev The zero address indicates there is no approved address.
  ///  Throws unless `msg.sender` is the current NFT owner, or an authorized
  ///  operator of the current owner.
  /// @param _approved The new approved NFT controller
  /// @param _tokenId The NFT to approve
  function approve(address _approved, uint256 _tokenId) external payable validateOperator(msg.sender, _tokenId) {
    require(msg.sender != _approved, "Sender cannot be the approved one");
    allowed[msg.sender][_tokenId] = _approved;
    emit Approval(msg.sender, _approved, _tokenId);
  }

  /// @notice Count all NFTs assigned to an owner
  /// @dev NFTs assigned to the zero address are considered invalid, and this
  ///  function throws for queries about the zero address.
  /// @param _owner An address for whom to query the balance
  /// @return The number of NFTs owned by `_owner`, possibly zero
  function balanceOf(address _owner) external view returns (uint256) {
    return tokenBalances[_owner];
  }

  /// @notice Get the approved address for a single NFT
  /// @dev Throws if `_tokenId` is not a valid NFT.
  /// @param _tokenId The NFT to find the approved address for
  /// @return The approved address for this NFT, or the zero address if there is none
  function getApproved(uint256 _tokenId) external view returns (address) {
    return allowed[this.ownerOf(_tokenId)][_tokenId];
  }

  /// @notice Query if an address is an authorized operator for another address
  /// @param _owner The address that owns the NFTs
  /// @param _operator The address that acts on behalf of the owner
  /// @return True if `_operator` is an approved operator for `_owner`, false otherwise
  function isApprovedForAll(address _owner, address _operator) external view returns (bool) {
    return allowedForAll[_owner][_operator];
  }

  /// @notice Find the owner of an NFT
  /// @dev NFTs assigned to zero address are considered invalid, and queries
  ///  about them do throw.
  /// @param _tokenId The identifier for an NFT
  /// @return The address of the owner of the NFT
  function ownerOf(uint256 _tokenId) external view returns (address) {
    return tokens[_tokenId];
  }

  /// @notice Enable or disable approval for a third party ("operator") to manage
  ///  all of `msg.sender`'s assets
  /// @dev Emits the ApprovalForAll event. The contract MUST allow
  ///  multiple operators per owner.
  /// @param _operator Address to add to the set of authorized operators
  /// @param _approved True if the operator is approved, false to revoke approval
  function setApprovalForAll(address _operator, bool _approved) external {
    allowedForAll[msg.sender][_operator] = _approved;
    emit ApprovalForAll(msg.sender, _operator, _approved);
  }

  /// @notice Transfer ownership of an NFT -- THE CALLER IS RESPONSIBLE
  ///  TO CONFIRM THAT `_to` IS CAPABLE OF RECEIVING NFTS OR ELSE
  ///  THEY MAY BE PERMANENTLY LOST
  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT.
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  function transferFrom(address _from, address _to, uint256 _tokenId) external payable validateOperator(_from, _tokenId) {
    bool isOwner = this.ownerOf(_tokenId) != msg.sender;
    bool isOperator = this.isApprovedForAll(_from, msg.sender);
    bool isApproved = this.getApproved(_tokenId) == msg.sender;
    if (isOwner || isOperator || isApproved) {
      removeBalance(_from);
      tokens[_tokenId] = _to;
      emit Transfer(_from, _to, _tokenId);
    } else {
      revert("msg.sender is not the current owner, an authorized operator, or the approved address");
    }
  }

  /// Custom implementation for management purposes

  /// @dev This function is called when a person sends Ether to the contract
  /// without any data (or when the data describes a function that does not
  /// exist). Basically, this is the fallback function of the contract.
  /// The require is there to assure this function is only called to up
  /// the Ether balance of a sender
  function() public payable {
    require (msg.value > 0, "Fallback function with no value");
  }

  /// @dev Add token balance of a person. This is just a helper function
  /// for clarity. Note that this does NOT up the Ether balance of a user.
  function addBalance(address _owner) private {
    tokenBalances[_owner] += 1;
  }

  function createToken(uint _price, address _metadata) external payable {
    // TODO this should be empty
    require (owner == msg.sender, "Only the contract deployer can create tokens");
    uint256 newId = totalSupply;
    tokens[newId] = msg.sender;
    addBalance(tokens[newId]);
    tokenPrices[newId] = _price;
    if (_metadata != address(0)) {
      metadata[newId] = _metadata;
    }
    totalSupply += 1;
    emit Transfer(address(0), tokens[newId], newId);
    if (_price > 0) {
      emit PlotForSale(newId, _price);
    }
  }

  function purchase(uint256 _tokenId) public payable {
    // TODO this should be empty
    require (msg.value >= tokenPrices[_tokenId], "Not enough funds to purchase token");
    tokens[_tokenId].transfer(msg.value);
    removeBalance(tokens[_tokenId]);
    tokens[_tokenId] = msg.sender;
    addBalance(tokens[_tokenId]);
    emit PlotPurchased(_tokenId, tokenPrices[_tokenId]);
    tokenPrices[_tokenId] = 0;
  }

  function removeBalance(address _owner) private {
    require(tokenBalances[_owner] > 0);
    tokenBalances[_owner] -= 1;
  }

  function setPrice(uint256 _tokenId, uint256 _price) public payable validateOperator(msg.sender, _tokenId) {
    // TODO this should be empty : BONUS
    tokenPrices[_tokenId] = _price;
    if (_price > 0) {
      emit PlotForSale(_tokenId, _price);
    }
  }

  /// @notice Not implemented for the exercise, but are in essence required as of ERC721!

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev Throws unless `msg.sender` is the current owner, an authorized
  ///  operator, or the approved address for this NFT. Throws if `_from` is
  ///  not the current owner. Throws if `_to` is the zero address. Throws if
  ///  `_tokenId` is not a valid NFT. When transfer is complete, this function
  ///  checks if `_to` is a smart contract (code size > 0). If so, it calls
  ///  `onERC721Received` on `_to` and throws if the return value is not
  ///  `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`.
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  /// @param data Additional data with no specified format, sent in call to `_to`
  function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable {
    revert("Not implemented");
  }

  /// @notice Transfers the ownership of an NFT from one address to another address
  /// @dev This works identically to the other function with an extra data parameter,
  ///  except this function just sets data to "".
  /// @param _from The current owner of the NFT
  /// @param _to The new owner
  /// @param _tokenId The NFT to transfer
  function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable {
    this.safeTransferFrom(_from, _to, _tokenId, "");
  }
}
