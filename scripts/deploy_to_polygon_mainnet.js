const { ethers } = require("hardhat");

async function main() {
    //Defining the Mumbai Testnet Variables
    let fweb3Address = 0x4a14ac36667b574b08443a15093e417db909d7a3;
    let faucetDripBase = 222;
    let faucetDripDecimal = 18; 

    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);

    const Faucet = await ethers.getContractFactory("SchusterFWEB3Faucet");
    const faucet = await Faucet.deploy(fweb3Address, faucetDripBase, faucetDripDecimal);

    console.log("ERC20 Token address:", schusterToken.address);
    console.log("Faucet address: ", faucet.address);
    console.log("Faucet Drip Amount (in Token Wei): ", (faucetDripBase * (10**faucetDripDecimal))/(10**18));
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });