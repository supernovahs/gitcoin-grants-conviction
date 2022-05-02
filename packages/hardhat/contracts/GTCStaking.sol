pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "./GTC.sol";

import "hardhat/console.sol";
contract GTCStaking {

  event VoteCasted(
    uint256 voteId,
    address voter,
    uint256 amount,
    uint256 grantId,
    uint256 lockedSince,
    uint256 lockedUntil
  );

  event TokensReleased(
    address voter,
    uint256 amount
  );

  GTC gtcToken;

  struct Vote {
    uint256 voteId;
    address voter;
    uint256 amount;
    uint256 grantId;
    uint256 lockedSince;
    uint256 lockedUntil;
  }

  struct BatchVoteParam {
    uint256 grantId; uint256 amount; uint256 lockedUntil;
  }

  Vote[] public votes;

  mapping (address => uint256[]) public voterToVoteIds;

  constructor(address tokenAddress) payable {
    gtcToken = GTC(tokenAddress);
  }

  function currentTimestamp() external view returns (uint256) {
    return block.timestamp;
  }

  function areTokensLocked(uint256 _voteId) external view returns (bool) {
    return votes[_voteId].lockedUntil > block.timestamp;
  }

  function vote(uint256 _grantId, uint256 _amount, uint256 _lockedUntil) public {
    require(_amount > 0, "Amount must be greater than 0");
    require(_lockedUntil > block.timestamp, "Locked until must be greater than current time");

    console.log("msg.sender %s", msg.sender);

    gtcToken.transferFrom(msg.sender, address(this), _amount);

    uint256 voteId = votes.length;

    votes.push(Vote({
      voteId: voteId,
      voter: msg.sender,
      amount: _amount,
      grantId: _grantId,
      lockedSince: block.timestamp,
      lockedUntil: _lockedUntil
    }));

    voterToVoteIds[msg.sender].push(voteId);

    emit VoteCasted(voteId, msg.sender, _amount, _grantId, block.timestamp, _lockedUntil);
  }

  function voteBatch(BatchVoteParam[] memory _batch) public {
    for (uint256 i = 0; i < _batch.length; i++) {
      vote(_batch[i].grantId, _batch[i].amount, _batch[i].lockedUntil);
    }
  }

  function getVotesForAddress(address _voter) external view returns (Vote[] memory) {
    uint256[] memory voteIds = voterToVoteIds[_voter];
    Vote[] memory votesForAddress = new Vote[](voteIds.length);
    for (uint256 i = 0; i < voteIds.length; i++) {
      votesForAddress[i] = votes[voteIds[i]];
    }
    return votesForAddress;
  }

  function releaseTokens(uint256 _voteId) public {
    require(votes[_voteId].voter == msg.sender, "You can't release tokens that you don't own");
    require(votes[_voteId].lockedUntil < block.timestamp , "You can't release your tokens yet");
    
    gtcToken.transfer(msg.sender, votes[_voteId].amount);

    emit TokensReleased(msg.sender, votes[_voteId].amount);
  }

}