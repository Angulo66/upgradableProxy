// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
//const hre = require("hardhat");

async function main() {
  const [deployer, notDeployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  const counterV1ContractFactory = await hre.ethers.getContractFactory('CounterV1')
  const counterV1Contract = await counterV1ContractFactory.deploy()
  await counterV1Contract.deployed()
  const counterV2ContractFactory = await hre.ethers.getContractFactory('CounterV2')
  const counterV2Contract = await counterV2ContractFactory.deploy()
  await counterV2Contract.deployed()
  const buggyProxyContractFactory = await hre.ethers.getContractFactory('Proxy')
  const buggyProxyContract = await buggyProxyContractFactory.deploy()
  await buggyProxyContract.deployed()

  console.table({
    counterV1Contract: counterV1Contract.address,
    counterV2Contract: counterV2Contract.address,
    buggyProxyContract: buggyProxyContract.address
  })
  await buggyProxyContract.upgradeTo(counterV1Contract.address)

  let implementation = await buggyProxyContract.implementation()
  //console.log('V1 Implementation:', implementation)
  let proxy = counterV1Contract.attach(buggyProxyContract.address)
  await proxy.increment()
  console.log('V1 increment', await proxy.count())

  await buggyProxyContract.upgradeTo(counterV2Contract.address)
  proxy = counterV2Contract.attach(buggyProxyContract.address)
  implementation = await proxy.implementation()
  console.log('V2 Implementation:', implementation)
  console.log('V2 count', await proxy.count())
  await proxy.decrement()
  console.log('V2 decrement()', await proxy.count())

  let admin = await proxy.admin()

  console.log('ifAdmin', admin)

  admin = await proxy.connect(notDeployer).admin()

  console.log('ifNotAdmin', admin)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
