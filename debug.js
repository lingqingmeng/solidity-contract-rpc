const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
console.log('web3: ',web3);
const compilers = require('./compilers');

// read files and create contracts for Token and Crowdsale
const tokenFile = fs.readFileSync('TokenERC20.sol');
const Token = compilers.createContract(tokenFile,'TokenERC20');
let tokenGasEstimate = 2 * web3.eth.estimateGas({data: '0x'+Token.bytecode});
console.log('tokenGasEstimate: ',tokenGasEstimate)

// generic contract - replace with eth forwarder and multisig
let contractName = 'TemplateToken';
let contractId = 'TEMTK';


let tokenDeployerAddress =  web3.eth.accounts[0];

tokenContractInstance = Token.contract.new(250, contractName, contractId, {
  gas: tokenGasEstimate,
  data: '0x' + Token.bytecode,
  from: tokenDeployerAddress,
}, (err, res) => {
  if (err) {
    console.error('Err Deploying Contract');
    console.log('err:', err);
    return;
  }
  if (res.address && res.transactionHash) {
    addressOfToken = res.address;
    console.log('Contract Deployed!');
    // deployCrowdsaleContract();
    // testToken(Token.contract, addressOfToken);
  } else {
    console.log('Waiting to receive input contract address...');
  }
});