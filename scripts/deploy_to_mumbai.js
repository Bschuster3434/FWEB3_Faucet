const { ethers } = require("hardhat");

async function main() {
    //Defining the Mumbai Testnet Variables
    let faucetDripBase = 100;
    let faucetDripDecimal = 18; 

    const [deployer, runner, addr1] = await ethers.getSigners();

    Token = await ethers.getContractFactory('SchusterTestToken');
    schusterToken = await Token.deploy();
  
    console.log("Deploying contracts with the account:", deployer.address);

    const Faucet = await ethers.getContractFactory("SchusterFWEB3Faucet");
    const faucet = await Faucet.deploy(schusterToken.address, faucetDripBase, faucetDripDecimal);

    await schusterToken.connect(deployer)
        .transfer(faucet.address, ethers.utils.parseEther("100000"))

    await faucet.verifyRunner(runner.address);

    console.log("ERC20 Token address:", schusterToken.address);
    console.log("Faucet address: ", faucet.address);
    console.log("Faucet Drip Amount (in Token Wei): ", (faucetDripBase * (10**faucetDripDecimal))/(10**18));
    console.log("Faucet currently has a Token balance of: " + await schusterToken.connect(deployer).balanceOf(faucet.address));
    console.log("Address Verified as Runner: ", runner.address," , ", await faucet.checkVerified(runner.address))
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
  });