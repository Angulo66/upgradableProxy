// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
//const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners()
  console.log('Deploying contracts with the account:', deployer.address)
  console.log('Account balance:', (await deployer.getBalance()).toString())
  const storageSlotContractFactory = await hre.ethers.getContractFactory('TestSlot')
  const slotContract = await storageSlotContractFactory.deploy()
  await slotContract.deployed()

  let slot = await slotContract.SLOT()

  let slotAddress = await slotContract.getSlot()

  await slotContract.writeSlot(slotContract.address)

  console.table({
    slotContract: slotContract.address,
    slotBytes32: slot,
    slotAddress: slotAddress
  })

  console.log('After writeSlot')
  slot = await slotContract.SLOT()

  slotAddress = await slotContract.getSlot()
  console.table({
    slotContract: slotContract.address,
    slotBytes32: slot,
    slotAddress: slotAddress
  })
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
