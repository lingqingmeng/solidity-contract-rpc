// Yevgeniy Spektor
// yevgeniy.spektor@gmail.com
// Dec 5, 2017

const fs = require('fs');
const Web3 = require('web3');
// this should be testrpc, run it with $ testrpc
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
const compilers = require('./compilers');
const BigNumber = require('big-number');

// read files and create contracts for Token and Crowdsale
const tokenFile = fs.readFileSync('TokenERC20.sol');
const crowdsaleFile = fs.readFileSync('Crowdsale.sol');
const Token = compilers.createContract(tokenFile,'TokenERC20');
const Crowdsale = compilers.createContract(crowdsaleFile, 'Crowdsale');

// Token 18 decimal places
const DECIMALS = '1000000000000000000';

// other useful things
const getBalance = (acct) => web3.fromWei(web3.eth.getBalance(acct), 'ether').toNumber();
const balances = web3.eth.accounts.map(account => getBalance(account))
// console.log('balances:',balances);

// takes in byte code of compiled contract Token.sol
let tokenGasEstimate = web3.eth.estimateGas({data: '0x'+Token.bytecode});
let crowdsaleGasEstimate = web3.eth.estimateGas({data: '0x'+Crowdsale.bytecode});

// Deploy Token Contract with initial supply of 234 tokens
const tokenContractInstance = Token.contract.new(234, 'TestToken', 'TTKN', {
  gas: tokenGasEstimate*2,
  data: '0x' + Token.bytecode,
  from: web3.eth.accounts[1],
}, (err, res) => {
  if (err) {
    console.error('ERROR DEPLOYING');
    console.log('err:', err);
    return;
  }
  if (res.address && res.transactionHash) {
    addressOfToken = res.address;
    console.log('Token Deployed!')
    testToken(Token.contract, res.address);
  } else {
    console.log('Waiting to receive Token contract address...');
  }
});

function testToken(contract, address){
  console.log('Token Address:', address);

  // Testing Transfering 17 tokens...
  testTransferFunction(contract, address, web3.eth.accounts[1], web3.eth.accounts[2], 17);
}

function testTransferFunction(contract, contractAddress, fromAddress, toAddress, amount) {
  console.log('-----------------');
  console.log('Testing Transfer Function...');
  // Reference to the deployed contract
  const token = contract.at(contractAddress);

  const amountScaled = BigNumber(DECIMALS).mult(amount);

  const initialBalanceFrom = BigNumber(token.balanceOf(fromAddress));
  const initialBalanceTo = BigNumber(token.balanceOf(toAddress));
  console.log('Initial Balance From:', BigNumber(initialBalanceFrom).div(DECIMALS).toString());
  console.log('Initial Balance To:', BigNumber(initialBalanceTo).div(DECIMALS).toString());

  // Call the transfer function
  token.transfer(toAddress, Number(amountScaled.toString()), {from: fromAddress}, (err, res) => {
    console.log('tx: ' + res);
    if (err) {
      console.error('TRANSFER FUNCTION ERROR!');
      console.error(err);
      return;
    }
    // Assert results
    const expectedFinalBalanceFrom = BigNumber(initialBalanceFrom).subtract(amountScaled);
    const expectedFinalBalanceTo = BigNumber(initialBalanceTo).add(amountScaled);
    const actualFinalBalanceFrom = BigNumber(token.balanceOf(fromAddress));
    const actualFinalBalanceTo = BigNumber(token.balanceOf(toAddress));

    console.log('Expected Final Balance From:', expectedFinalBalanceFrom.div(DECIMALS).toString());
    console.log('Expected Final Balance To:', expectedFinalBalanceTo.div(DECIMALS).toString());
    console.log('Actual Final Balance From:', actualFinalBalanceFrom.div(DECIMALS).toString());
    console.log('Actual Final Balance To:', actualFinalBalanceTo.div(DECIMALS).toString());

    if ((expectedFinalBalanceFrom.toString() === actualFinalBalanceFrom.toString()) &&
        (expectedFinalBalanceTo.toString() == actualFinalBalanceTo.toString())) {
      console.log('Transfer Function Test Successful');
      return true;
    } else {
      console.error('TRANSFER FUNCTION TEST FAILED!');
      return false;
    }
  });
}

/*
// Let's test the deployed contract

    testContract(Token.contract,res.address);
    testCall(Token.contract,res.address);
    testApprove(Token.contract,res.address);
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
        testCrowdSale2(Crowdsale.contract,response.address)
      }
    })
  } 
  */


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

