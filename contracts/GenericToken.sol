pragma solidity ^0.4.24;

contract GenericToken {
    bytes public name;
    uint public totalSupply;
    mapping (address => uint) private balances;
    mapping (address => mapping(address => uint)) private allowances;
    uint8 public constant decimals = 18;  // 18 is the most common number of decimal places

    constructor(bytes _name, uint _totalSupply) public {
        if (_name.length > 0) {
            name = _name;
        } else {
            name = "Generic Token";
        }
        if (totalSupply > 0) {
            totalSupply = _totalSupply;
        } else {
            totalSupply = 42000000000000000000000000000000;
        }
        balances[msg.sender] = totalSupply;
    }

    function balanceOf(address _tokenOwner) public view returns (uint _balance) {
        return balances[_tokenOwner];
    }

    function allowance(address _tokenOwner, address _spender) public view returns (uint _remaining) {
        return allowances[_tokenOwner][_spender];
    }

    function transfer(address _to, uint _tokens) public returns (bool _success) {
        require(balances[msg.sender] >= _tokens, "Not enough funds");
        balances[msg.sender] -= _tokens;
        balances[_to] += _tokens;
        emit Transfer(msg.sender, _to, _tokens);
        return true;
    }

    function approve(address _spender, uint _tokens) public returns (bool _success) {
        require(allowances[msg.sender][_spender] + balances[msg.sender] >= _tokens, "Not enough funds");
        balances[msg.sender] -= (_tokens - allowances[msg.sender][_spender]);
        allowances[msg.sender][_spender] = _tokens;
        emit Approval(msg.sender, _spender, _tokens);
        return true;
    }

    function transferFrom(address _from, address _to, uint _tokens) public returns (bool _success) {
        require(allowances[_from][msg.sender] >= _tokens, "No enought funds");
        allowances[_from][msg.sender] -= _tokens;
        balances[_to] += _tokens;
        emit Transfer(_from, _to, _tokens);
        return true;
    }

    event Transfer(address indexed _from, address indexed _to, uint _tokens);
    event Approval(address indexed _tokenOwner, address indexed _spender, uint _tokens);
}
