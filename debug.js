const fs = require('fs');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const compilers = require('./compilers');

// read files and create contracts for Token and Crowdsale
const tokenFile = fs.readFileSync('TokenERC20.sol');
const Token = compilers.createContract(tokenFile,'TokenERC20');
let tokenGasEstimate = 2 * web3.eth.estimateGas({data: '0x'+Token.bytecode});
console.log('tokenGasEstimate: ',tokenGasEstimate)

// 
let tokenName = 'TemplateToken';
let tokenSymbol = 'TTA';


let tokenDeployerAddress =  web3.eth.accounts[0];

tokenContractInstance = Token.contract.new(250, tokenName, tokenSymbol, {
  gas: tokenGasEstimate,
  data: '0x' + Token.bytecode,
  from: tokenDeployerAddress,
}, (err, res) => {
  if (err) {
    console.error('ERROR DEPLOYING TOKEN');
    console.log('err:', err);
    return;
  }
  if (res.address && res.transactionHash) {
    addressOfToken = res.address;
    console.log('Token Deployed!');
    // deployCrowdsaleContract();
    // testToken(Token.contract, addressOfToken);
  } else {
    console.log('Waiting to receive Token contract address...');
  }
});