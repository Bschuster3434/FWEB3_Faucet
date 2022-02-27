// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0 <=0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


contract SchusterFWEB3Faucet is Ownable {

    IERC20 private token;
    uint private dripAmount;

    mapping(address => bool) excludedAddress;
    mapping(address => bool) verifiedRunner;

    event RunnerAdded(address indexed _runner);
    event RunnerRemoved(address indexed _runner);
    event FaucetUsed(address indexed _user, address indexed _runner);
    event BulkExclusion(address [] _users);
    event DripAmountSet(uint _dripAmount);

    constructor (IERC20 _token, uint _faucetDripBase, uint _faucetDripDecimal) {
        token = _token;
        dripAmount = _faucetDripBase * 10**_faucetDripDecimal;
        emit DripAmountSet(dripAmount);
    }

    modifier onlyVerified() {
        require(verifiedRunner[msg.sender], "Not Verified to Run Faucet");
        _;
    }

    function getDripAmount() view external returns (uint) {
        return dripAmount;
    }

    function setDripAmount(uint _faucetDripBase, uint _faucetDripDecimal) external onlyOwner {
        dripAmount = _faucetDripBase * 10**_faucetDripDecimal;
        emit DripAmountSet(dripAmount);
    }

    function verifyRunner(address _runner) external onlyOwner {
        require(!verifiedRunner[_runner], "Runner Already Verified");
        verifiedRunner[_runner] = true;
        emit RunnerAdded(_runner);
    }
    
    function removeRunner(address _runner) external onlyOwner {
        require(verifiedRunner[_runner], "Runner Not Verified");
        verifiedRunner[_runner] = false;
        emit RunnerRemoved(_runner);        
    }

    function checkVerified(address _runner) view external returns (bool) {
        return verifiedRunner[_runner];
    }

    function hasUsedFaucet(address _user) view external returns (bool) {
        return excludedAddress[_user];
    }

    function bulkExcludeUsers(address [] memory _users) external onlyOwner {
        for (uint i = 0; i < _users.length; i++) {
            excludedAddress[_users[i]] = true;
        }
        emit BulkExclusion(_users);
    }

    function faucet(address payable _user) external onlyVerified {
        require(!excludedAddress[_user], "User already used faucet");
        require(token.balanceOf(address(this)) >= dripAmount, "No faucet tokens to distribute");
        token.transfer(_user, dripAmount);
        excludedAddress[_user] = true;
        emit FaucetUsed(_user, msg.sender);
    }
}