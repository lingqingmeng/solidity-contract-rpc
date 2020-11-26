const fs = require('fs');
const Web3 = require('web3');
// this should be testrpc, run it with $ testrpc
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
const compilers = require('./compilers');

// read files and create contracts for Token and Crowdsale
const tokenFile = fs.readFileSync('TokenERC20.sol');
const crowdsaleFile = fs.readFileSync('Crowdsale.sol');
const Token = compilers.createContract(tokenFile,'TokenERC20');
const Crowdsale = compilers.createContract(crowdsaleFile, 'Crowdsale');

// other useful things
const getBalance = (acct) => web3.fromWei(web3.eth.getBalance(acct), 'ether').toNumber();
const balances = web3.eth.accounts.map(account => getBalance(account))
console.log('balances:',balances);

// takes in byte code of compiled contract Token.sol
let tokenGasEstimate = web3.eth.estimateGas({data: '0x'+Token.bytecode});
let crowdsaleGasEstimate = web3.eth.estimateGas({data: '0x'+Crowdsale.bytecode});

let addressOfToken;
const tokenContractInstance = Token.contract.new({
  gas: tokenGasEstimate,
  data: '0x' + Token.bytecode,
  from: web3.eth.accounts[0] //web3.eth.coinbase
}, (err, res) => {
  if (err) {
    console.log('err:',err);
    return;
  }

  // Log the tx, you can explore status with eth.getTransaction()

  // If we have an address property, the contract was deployed
  if (!res.address) {
    console.log('no res.address:');
    return;
  }
  console.log('Token address: ' + res.address);
  addressOfToken = res.address; // 
  // Let's test the deployed contract
  testAllowances(Token.contract,res.address);


  const data = {
    ifSuccessfulSendTo: web3.eth.accounts[5],
    fundingGoalInEthers: web3.toHex(250),
    durationInMinutes: web3.toHex(7200),
    etherCostOfEachToken: web3.toHex(0.01),
    addressOfTokenUsedAsReward: addressOfToken
  };
  console.log('data:',data);
  console.log('crowdsaleGasEstimate:',crowdsaleGasEstimate);
  const crowdsaleContractInstance = Crowdsale.contract.new(
    data.ifSuccessfulSendTo,
    data.fundingGoalInEthers,
    data.durationInMinutes,
    data.etherCostOfEachToken,
    data.addressOfTokenUsedAsReward,{
      gas: crowdsaleGasEstimate*2,
      data: '0x' + Crowdsale.bytecode,
      from: web3.eth.accounts[1]
    }, (err,response) => {
    if (err) {
      console.log('err in contract deplo:',err);
      return;
    }

    // Log the tx, you can explore status with eth.getTransaction()
    console.log('response.transactionHash: ',response.transactionHash);
    // If we have an address property, the contract was deployed
    if (response.address) {
      console.log('Crowdsale contract address: ' + response.address);
      const token = Token.contract.at(res.address);
      testCrowdSale2(Crowdsale.contract,response.address) 
      
    }
  })
  
});



function testCrowdSale(contract,address){
  const crowdsale = contract.at(address);
  const goal = crowdsale.checkGoalReached.call();
  console.log('goal:',goal);
}

/**
 * @param {address} ifSuccessfulSendTo
 * @param {uint} fundingGoalInEthers
 * @param {uint} durationInMinutes
 * @param {uint} etherCostOfEachToken
 * @param {address} addressOfTokenUsedAsReward
 */
function testCrowdSale2(contract,address) {
  const crowdsale = contract.at(address);
  const txObject = {
    from: web3.eth.accounts[5],
    to: address,
    value: web3.toWei(12,'ether'),
    gas: 98001
  };
  console.log('txObject:',txObject);
  web3.eth.sendTransaction(txObject,(err,hash) => {
    if (err) {
      console.log('err:',err);
      return;
    }
    console.log('hash:',hash);
  });
  
  
}



function testCall(contract,address) {
  const token = contract.at(address);
  const tokenBalances = token.balanceOf.call(web3.eth.accounts[1]);
  const sum = token.add.call(13,12);
  
  const stored = token.setStore.call(1,2);
  console.log('stored:',stored);
  console.log('stored.s:',stored.s);
  console.log('stored.e:',stored.e);
  const gotten = token.getStoreValue.call(1);
  console.log('gotten:',gotten);
}


// default account is web3.eth.accounts[0]
function testApprove(contract,address) {
  const token = contract.at(address);
  const me = token.whoami.call();
  const approved = token.approve.call(web3.eth.accounts[3],1230);
  console.log('approved:',approved);
  console.log('web3.eth.accounts[0]:',web3.eth.accounts[3]);
  const allowances = token.allowance.call(web3.eth.accounts[0],web3.eth.accounts[3]);
  console.log('allowances:',allowances);
}

function testAllowances(contract,address) {
  
}

function testContract(contract,address) {
  // Reference to the deployed contract
  const token = contract.at(address);
  // Destination account for test
  const dest_account = '0x002D61B362ead60A632c0e6B43fCff4A7a259285';

  // Assert initial account balance, should be 100000
  const balance1 = token.balances.call(web3.eth.accounts[1]);
  console.log(balance1 == 1000000);

  // Call the transfer function
  token.transfer(dest_account, 120, {from: web3.eth.accounts[1]}, (err, res) => {
    // Log transaction, in case you want to explore
    console.log('tx: ' + res);
    // Assert destination account balance, should be 100 
    const balance2 = token.balances.call(dest_account);
    console.log(balance2 == 120);
  });
}