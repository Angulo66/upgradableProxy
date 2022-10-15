require('@nomicfoundation/hardhat-toolbox')

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    //version: '0.8.9',
    compilers: [
      {
        version: '0.8.9'
      },
      {
        version: '0.8.13'
      }
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}