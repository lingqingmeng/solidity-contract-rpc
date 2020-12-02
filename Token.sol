pragma solidity >=0.4.0 <0.8.0;

contract Token {
    
    function Token() {
        balances[msg.sender] = 1000000;
    }

    function transfer(address _to, uint _amount) {
        if (balances[msg.sender] < _amount) {
            throw;
        }

        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
    
    function balanceOf(address _owner) returns (uint256 balance) {
        return balances[_owner];
    }

    struct Buyer {
        uint depositInWei;  // running total of buyer's deposit
        uint bidWeiAmount;  // bid amount in WEI from off-chain signed bid
        uint totalTokens;   // total amount of tokens to distribute to buyer
        bool hasWithdrawn;  // bool to check if buyer has withdrawn
    }

    mapping(uint => Buyer) public allBuyers; 

    function add(uint a, uint b) returns (uint) {
        uint c = a + b;
        assert(c >= a);
        return c;
    }

    function whoami() returns (address) {
        return msg.sender;
    }

    function allowance(address _owner, address _spender)
        constant public
        returns (uint256)
    {
        return allowed[_owner][_spender];
    }

    function setStore(uint a, uint b) returns (uint) {
        istore[a] = b;
        return istore[a];
    }

    function getStoreValue(uint a) returns (uint) {
        if (istore[a] == 0) {
            istore[a] = 30;
        }
        return istore[a];
    }

    function approve(address _spender, uint256 _value)
        public
        returns (bool)
    {
        allowed[msg.sender][_spender] = _value;
        return true;
    }

    mapping (address => uint) public balances;
    mapping (address => mapping (address => uint256)) allowed;
    mapping (uint => uint) public istore;

}