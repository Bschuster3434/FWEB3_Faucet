const { expect } = require("chai");
const { network } = require("hardhat");

describe("SchusterFWEB3Faucet", function () {
    let Token;
    let schusterToken;
    let Faucet;
    let faucet;
    let owner;
    let runner1;
    let runner2;
    let addr1;
    let addr2;
    let addr3;
    let addrs;
    let faucetDripBase;
    let trailAddresses;


    beforeEach(async function () {
        Token = await ethers.getContractFactory('SchusterTestToken');
        [owner, runner1, runner2, addr1, addr2, addr3, ...addrs] = await ethers.getSigners();
        schusterToken = await Token.deploy();

        faucetDripBase = 1;

        Faucet = await ethers.getContractFactory("SchusterFWEB3Faucet");
        faucet = await Faucet.deploy(schusterToken.address, faucetDripBase, 18);

        faucet.verifyRunner(runner1.address);
        faucet.verifyRunner(runner2.address);

        schusterToken.transfer(faucet.address, ethers.utils.parseEther("2"))
    
    })

    describe("Verifiers", function () {
        it("Only Allows Verified runners to run the faucet contract", async function () {
            await faucet.connect(runner1).faucet(addr1.address);
            await expect(faucet.connect(addr1).faucet(addr2.address))
                .to.be.revertedWith("Not Verified to Run Faucet");
        });

        it("Doesn't allow users who are removed to run the faucet command", async function () {
            await faucet.connect(runner1).faucet(addr1.address);
            faucet.removeRunner(runner1.address);
            await expect(faucet.connect(runner1).faucet(addr2.address))
                .to.be.revertedWith("Not Verified to Run Faucet");
        });

        it("Emits an event when runners are added and removed", async function () {
            expect(await faucet.verifyRunner(addr1.address))
                .to.emit(faucet, "RunnerAdded")
                .withArgs(addr1.address);
            expect(await faucet.removeRunner(addr1.address))
                .to.emit(faucet, "RunnerRemoved")
                .withArgs(addr1.address);            
        })

        it("Does not allow you to add a verified user if they are already added", async function () {
            await expect(faucet.verifyRunner(runner1.address))
                .to.be.revertedWith("Runner Already Verified");            
        })

        it("Does not allow you to remove a user if they haven't been verified", async function () {
            await expect(faucet.removeRunner(addr1.address))
                .to.be.revertedWith("Runner Not Verified");            
        })

        it("Only allows the owner to verify or remove Runners", async function () {
            await expect(faucet.connect(addr1).removeRunner(runner1.address))
                .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(faucet.connect(runner1).removeRunner(runner2.address))
                .to.be.revertedWith("Ownable: caller is not the owner"); 
            await expect(faucet.connect(runner1).verifyRunner(addr3.address))
                .to.be.revertedWith("Ownable: caller is not the owner");                     
        })

        it("Allows anyone to check if an address is verified", async function () {
            expect(await faucet.checkVerified(runner1.address)).to.equal(true);
            await faucet.removeRunner(runner1.address);
            expect(await faucet.checkVerified(runner1.address)).to.equal(false);
            expect(await faucet.checkVerified(addr1.address)).to.equal(false);
            await faucet.verifyRunner(addr1.address);
            expect(await faucet.checkVerified(addr1.address)).to.equal(true);

        })
    })

    describe("Faucet", function () {
        it("Does not allow the owner to renounce ownership", async function () {
            await expect(faucet.renounceOwnership())
                .to.be.revertedWith("Cannot renounce ownership");
        })

        it("Sends Tokens to new users who utilize the faucet", async function () {
            const addr1PreFaucetBalance = await schusterToken.connect(addr1).balanceOf(addr1.address);

            await faucet.connect(runner1).faucet(addr1.address);

            const addr1PostFaucetBalance = await schusterToken.connect(addr1).balanceOf(addr1.address);

            expect(addr1PreFaucetBalance).to.equal("0")
            expect(addr1PostFaucetBalance).to.equal(addr1PreFaucetBalance.add(ethers.utils.parseEther(String(faucetDripBase))))
        })

        it("Only allows a user to utilize the faucet once", async function () {
            await faucet.connect(runner1).faucet(addr1.address);
            await expect(faucet.connect(runner1).faucet(addr1.address))
                .to.be.revertedWith("User already used faucet");

            
            await faucet.connect(runner1).faucet(runner1.address);
            await expect(faucet.connect(runner1).faucet(runner1.address))
                .to.be.revertedWith("User already used faucet");
        })

        it("Should emit an event when a faucet transaction happens", async function () {
            expect(await faucet.connect(runner1).faucet(addr1.address))
                .to.emit(faucet, "FaucetUsed")
                .withArgs(addr1.address, runner1.address);
            expect(await faucet.connect(runner2).faucet(runner2.address))
                .to.emit(faucet, "FaucetUsed")
                .withArgs(runner2.address, runner2.address);                   
        })

        it("Should throw a pre-emptive error if the faucet has no tokens", async function () {
            await faucet.connect(runner1).faucet(runner1.address);
            await faucet.connect(runner1).faucet(addr1.address);
            await expect(faucet.connect(runner1).faucet(addr2.address))
                .to.be.revertedWith("No faucet tokens to distribute");
        })

        it("Should allow me to see if someone has used the faucet", async function () {
            const addr1PreUsedFaucet = await faucet.hasUsedFaucet(addr1.address);
            await faucet.connect(runner1).faucet(addr1.address);
            const addr1PostUsedFaucet = await faucet.hasUsedFaucet(addr1.address);

            expect(addr1PreUsedFaucet).to.equal(false);
            expect(addr1PostUsedFaucet).to.equal(true);
        })

        it("Should show me the drip amount when asked", async function () {
            let dripAmount = await faucet.getDripAmount();
            expect(dripAmount).to.equal(ethers.utils.parseEther(String(faucetDripBase)));
        })

        it("Should allow the owner to change the drip amount", async function () {
            await faucet.setDripAmount(5, 18);
            let dripAmount = await faucet.getDripAmount();
            expect(dripAmount).to.equal(ethers.utils.parseEther(String(5)));

            await faucet.setDripAmount(3, 16);
            dripAmount = await faucet.getDripAmount();
            expect(dripAmount).to.equal(ethers.utils.parseEther(String(.03)));
        })

        it("Should not allow non-owners to execute the setDripAmount", async function () {
            await expect(faucet.connect(addr1).setDripAmount(1,1))
                .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(faucet.connect(runner1).setDripAmount(18, 18))
                .to.be.revertedWith("Ownable: caller is not the owner");     
        })
    })

    describe("Exclusions", function () {
        beforeEach(async function () {
            // Create the address array for the bulkFunctionExcluder
            trailAddresses = [];
            for (i = 0; i < addrs.length; i++) {
                trailAddresses.push(addrs[i].address)
            }
        })

        it("Should allow me to bulk exclude individuals", async function () {
            await faucet.connect(owner).bulkExcludeUsers(trailAddresses);
            await expect(faucet.connect(runner1).faucet(addrs[0].address))
                .to.be.revertedWith("User already used faucet");
            await expect(faucet.connect(runner1).faucet(addrs[3].address))
                .to.be.revertedWith("User already used faucet");               
        })

        it("Should only allow the contract owner to use bulk exclude", async function () {
            await expect(faucet.connect(addr1).bulkExcludeUsers(trailAddresses))
                .to.be.revertedWith("Ownable: caller is not the owner");
            await expect(faucet.connect(runner1).bulkExcludeUsers(trailAddresses))
                .to.be.revertedWith("Ownable: caller is not the owner");                  
        })


    })

})