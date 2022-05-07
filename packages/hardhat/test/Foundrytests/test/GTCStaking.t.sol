pragma solidity ^0.8.10;
//SPDX-License-Identifier: MIT

import "../../../contracts/GTCStaking.sol";
import "../../../contracts/GTC.sol";
import "../test.sol";
import "../Hevm.sol";

import "hardhat/console.sol";

/// @author: DanieleSalatti
/// @Description: For more details see https://book.getfoundry.sh/

/// @dev This is a test contract that uses the `Foundry` library.   It is a
/// @dev DSTest contract is a helper contract that provides cheatcodes for testing purposes.
/// @dev To test, install Foundry and run forge test -vvvvv in the root directory.
contract testing is DSTest{
    Hevm vm = Hevm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    /// @dev Declaring the imported contracts as a variable
    GTCStaking gtcStaking;
    GTC gtcToken;

    /// @notice setUp function in Foundry is like a beforeEach function used in Hardhat!
    /// @dev This function is called before each test.

    function setUp() public {
        vm.warp(50);
        /// @notice: Instatntiating the imported contract
        gtcToken = new GTC();
        gtcStaking = new GTCStaking(address(gtcToken));
        gtcToken.mint(address(1), 100 ether);
    }

    /// @dev Testing the currentTimestamp function.
    /// @dev To view indepth details of the test traces. Use forge test -vvvvv
    function testCurrentTimestamp() public {
        vm.warp(100);
        /// @notice: Console log to view the output
        console.log(gtcStaking.currentTimestamp());

        /// @notice: Asserting the output using DsTest Cheatcode.
        assertEq(gtcStaking.currentTimestamp(), 100);
    }

    function testVote() public {
        vm.startPrank(address(1));
        gtcToken.approve(address(gtcStaking), 10 ether);
        gtcStaking.vote(1, 10 ether, 200);
        
        (uint256 voteId,
        address voter,
        uint256 amount,
        uint256 grantId,
        uint256 lockedSince,
        uint256 lockedUntil,
        bool released ) = gtcStaking.votes(0);

        assertEq(voteId, 0);
        assertEq(voter, address(1));
        assertEq(grantId, 1);
        assertEq(amount, 10 ether);
        assertEq(lockedSince, 50);
        assertEq(lockedUntil, 200);
        assertTrue(!released);
    }

        function testVoteBatch() public {
        vm.startPrank(address(1));
        gtcToken.approve(address(gtcStaking), 30 ether);

        GTCStaking.BatchVoteParam[] memory params = new GTCStaking.BatchVoteParam[](2);

        params[0] = GTCStaking.BatchVoteParam(1, 10 ether, 200);
        params[1] = GTCStaking.BatchVoteParam(1, 15 ether, 300);

        gtcStaking.voteBatch(params);
        
        (uint256 voteId,
        address voter,
        uint256 amount,
        uint256 grantId,
        uint256 lockedSince,
        uint256 lockedUntil,
        bool released ) = gtcStaking.votes(0);

        assertEq(voteId, 0);
        assertEq(voter, address(1));
        assertEq(grantId, 1);
        assertEq(amount, 10 ether);
        assertEq(lockedSince, 50);
        assertEq(lockedUntil, 200);
        assertTrue(!released);
    
    }

    function testReleaseTokens() public {
        vm.startPrank(address(1));
        gtcToken.approve(address(gtcStaking), 30 ether);

        GTCStaking.BatchVoteParam[] memory params = new GTCStaking.BatchVoteParam[](2);

        params[0] = GTCStaking.BatchVoteParam(1, 10 ether, 200);
        params[1] = GTCStaking.BatchVoteParam(1, 15 ether, 300);
        
        gtcStaking.voteBatch(params);
        
        (/*uint256 voteId*/,
        /*address voter*/,
        /*uint256 amount*/,
        /*uint256 grantId*/,
        /*uint256 lockedSince*/,
        uint256 lockedUntil,
        /*bool released*/) = gtcStaking.votes(1);

        assertEq(lockedUntil, 300);

        vm.expectRevert("You can't release your tokens yet");
        gtcStaking.releaseTokens(1);

        vm.warp(310);

        uint256 balance = gtcToken.balanceOf(address(1));

        gtcStaking.releaseTokens(1);

        assertEq(balance + 15 ether, gtcToken.balanceOf(address(1)));
    }
}