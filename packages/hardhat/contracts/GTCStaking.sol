pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "./GTC.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract GTCStaking is Ownable {
  using SafeMath for uint256;

  uint256 public halfLifeInSeconds;
  uint256 public convictionFactor;
  uint256 public constant TEN_THOUSAND = 10000;

  event VoteCasted(
    uint256 voteId,
    address voter,
    uint256 amount,
    uint256 grantId,
    uint256 lockedSince,
    uint256 lockedUntil
  );

  struct ConvictionByVoteIdRecord {
    uint256 voteID;
    uint256 grantId;
    address voter;
    uint256 value;
    bool open;
    uint256 lockedSince;
    uint256 lockedUntil;
  }

  struct ConvictionByProposalRecord {
    uint256 grantId;
    uint256 value;
  }


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
    bool released;
  }

  struct BatchVoteParam {
    uint256 grantId; uint256 amount; uint256 lockedUntil;
  }

  Vote[] public votes;
  uint256[] public grants;
  mapping (address => uint256[]) public voterToVoteIds;
  mapping (uint256 => uint256[]) public votesByProposal;

  constructor(address tokenAddress) payable {
    gtcToken = GTC(tokenAddress);
    halfLifeInSeconds = 3 days;
    convictionFactor = 1; // 0.01%
  }

  function sqrt(uint x) public pure returns (uint256 y) {
    uint z = (x + 1) / 2;
    y = x;
    while (z < y) {
        y = z;
        z = (x / z + z) / 2;
    }
  }

  function percentage(uint _amount, uint256 _basisPoints) public pure returns (uint256) {
    require ((_amount / TEN_THOUSAND) * TEN_THOUSAND == _amount, "Amount mst be greater than 10k");
    return (_amount * _basisPoints) / TEN_THOUSAND;
  }

  function setHalfLife(uint256 _halfLifeInSeconds) external onlyOwner {
    halfLifeInSeconds = _halfLifeInSeconds;
  }

  function setConvictionFactor(uint256 _convictionFactor) external onlyOwner {
    convictionFactor = _convictionFactor;
  }

  function currentTimestamp() external view returns (uint256) {
    return block.timestamp;
  }

  function areTokensLocked(uint256 _voteId) external view returns (bool) {
    return votes[_voteId].lockedUntil > block.timestamp && !votes[_voteId].released;
  }

  function vote(uint256 _grantId, uint256 _amount, uint256 _lockedUntil) public {
    require(_amount > 0, "Amount must be greater than 0");
    require(_lockedUntil > block.timestamp, "Locked until must be greater than current time");

    gtcToken.transferFrom(msg.sender, address(this), _amount);

    uint256 voteId = votes.length;

    votes.push(Vote({
      voteId: voteId,
      voter: msg.sender,
      amount: _amount,
      grantId: _grantId,
      lockedSince: block.timestamp,
      lockedUntil: _lockedUntil,
      released: false
    }));

    votesByProposal[_grantId].push(voteId);
    grants.push(voteId);


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
    // require(votes[_voteId].lockedUntil < block.timestamp , "You can't release your tokens yet");
    require(votes[_voteId].released == false , "Already released");
    
    votes[_voteId].released = true;
    gtcToken.transfer(msg.sender, votes[_voteId].amount);

    emit TokensReleased(msg.sender, votes[_voteId].amount);
  }


  function calculateDecayAtTime(uint256 _valueAtClosing, uint256 _lockedUntil, uint256 _timestampAt) public view returns (uint256) {
    if (_lockedUntil > _timestampAt) {
      return _valueAtClosing;
    }
    uint256 deltaT = _timestampAt - _lockedUntil;
    _valueAtClosing >>= (deltaT / halfLifeInSeconds); 
    deltaT %= halfLifeInSeconds;
    return _valueAtClosing - _valueAtClosing * deltaT / halfLifeInSeconds / 2;
  }

  function calculateConvictionAtTime(uint256 _valueAtOpen, uint256 _lockedSince, uint256 _timestampAt) public view returns (uint256) {
    uint256 deltaT = _timestampAt - _lockedSince;
    return _valueAtOpen + ( (percentage(_valueAtOpen, convictionFactor) >> 16)  * deltaT**2);
  }

  
  function calculateConvictionByVoteAtTime(uint256 timeAt, uint256 voteId) public view returns (ConvictionByVoteIdRecord memory) {
      ConvictionByVoteIdRecord memory ret;
    
      if (votes[voteId].lockedSince > timeAt) {
        return ret;
      }
      
      if (!votes[voteId].released || votes[voteId].lockedUntil > timeAt) {
          uint256 convictionCalculated = calculateConvictionAtTime(votes[voteId].amount, votes[voteId].lockedSince, timeAt);
          ret = ConvictionByVoteIdRecord(voteId, votes[voteId].grantId, votes[voteId].voter, convictionCalculated, true, votes[voteId].lockedSince, votes[voteId].lockedSince);
      } else {
          uint256 convictionCalculated = calculateConvictionAtTime(votes[voteId].amount, votes[voteId].lockedSince, votes[voteId].lockedUntil);
          ret = ConvictionByVoteIdRecord(voteId, votes[voteId].grantId, votes[voteId].voter, calculateDecayAtTime(convictionCalculated, votes[voteId].lockedUntil, timeAt), false, votes[voteId].lockedSince, votes[voteId].lockedUntil);
      }
      ret.value = sqrt(ret.value);
      return ret;
  }

  function calculateConvictionsByVoteId() public view returns (ConvictionByVoteIdRecord[] memory) {
    ConvictionByVoteIdRecord[] memory ret = new ConvictionByVoteIdRecord[](votes.length);
    for (uint256 i = 0; i < votes.length; i++) {
      ret[i] = calculateConvictionByVoteAtTime(block.timestamp, i);
    }
    return ret;
  }

function calculateConvictionsByProposalAtTime(uint256 timeAt) public view returns (ConvictionByProposalRecord[] memory) {
    
    ConvictionByProposalRecord[] memory ret = new ConvictionByProposalRecord[](grants.length);

    for (uint256 i = 0; i < grants.length; i++) {

      uint256[] memory voteIds = votesByProposal[grants[i]];
      uint256 convictionSum = 0;
      for (uint256 j = 0; j < voteIds.length; j++) {
        convictionSum += calculateConvictionByVoteAtTime(timeAt, voteIds[j]).value;
      }
      ret[i] = ConvictionByProposalRecord(grants[i], convictionSum ** 2);
    }
    return ret;
  }

  function calculateConvictionsByProposal() public view returns (ConvictionByProposalRecord[] memory) {
    return calculateConvictionsByProposalAtTime(block.timestamp);
  }

}