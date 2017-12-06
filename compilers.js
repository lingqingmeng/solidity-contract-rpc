const Web3 = require('web3');

const solc = require('solc');
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));


/**
 * read source file in memory

 * @param name {string} - Contract name without the .sol
 */
function createContract(input,name){
  const output = solc.compile(input.toString(), 1);
  const bytecode = output.contracts[`:${name}`].bytecode;
  const abi = JSON.parse(output.contracts[`:${name}`].interface);
  const contract = web3.eth.contract(abi);
  return {
    contract: contract,
    bytecode: bytecode
  };
}

module.exports = {
  createContract: createContract
}
