# FWEB3_Faucet
Faucet to Distribute FWEB3 to New Community Users

## Purpose
This faucet will act as a one time pull for new members of the FWEB3 community.

Every community member can pull out a certain amount of tokens from this faucet in order to be able to play the FWEB3 game. Users will only be able to pull from the faucet one time (the address will be locked).

This faucet can only be run by verified contracts to avoid abuse. This 'runner' will have access to the faucet function to distribute FWEB3.

## Key Functions

- faucet(address payable _user): Send FWEB3 tokens to the specified user. Fails if the user has received tokens. Only executable by verified runners.
- verifyRunner(address _runner): Verifies a runner who is able to use the faucet contract.
- removeRunner(address _runner): Removes the runner from the contract.
- checkVerified(address _runner): Checks if a particular address is verified to run the faucet.
- setDripAmount(uint _faucetDripBase, uint _faucetDripDecimal): Defines how much FWEB3 to be despensed from the account. Can only be executed by the owner.
- bulkExcludeUsers(array [] _users): Excludes users from using the faucet. Can only be executed by the owner.
- hasUsedFaucet(address _user): Returns a bool if the user has used the faucet in the past.