pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "./GTC.sol";

//*********************************************************************//
// --------------------------- custom errors ------------------------- //
//*********************************************************************//
error INVALID_AMOUNT();
error INVALID_LOCK_DURATION();
error LOCK_DURATION_NOT_OVER();
error NOT_OWNER();
error TOKENS_ALREADY_RELAEASED();

/**
@title GTCStaking Contract
@notice Vote on gitcoin grants powered by conviction voting off-chain by staking your gtc.
*/
contract GTCStaking {
    event VoteCasted(
        uint256 voteId,
        address voter,
        uint256 amount,
        uint256 grantId,
        uint256 lockedSince,
        uint256 lockedUntil
    );

    event TokensReleased(address voter, uint256 amount);

    /// @notice gtc token contract instance.
    GTC gtcToken;

    /// @notice vote struct array.
    Vote[] public votes;

    /// @notice mapping which tracks the votes for a particular user.
    mapping(address => uint256[]) public voterToVoteIds;

    struct Vote {
        bool released;
        address voter;
        uint256 voteId;
        uint256 amount;
        uint256 grantId;
        uint256 lockedSince;
        uint256 lockedUntil;
    }

    struct BatchVoteParam {
        uint256 grantId;
        uint256 amount;
        uint256 lockedUntil;
    }

    /**
    @dev Constructor.
    @param tokenAddress gtc token address.
    */
    constructor(address tokenAddress) payable {
        gtcToken = GTC(tokenAddress);
    }

   /**
    @dev Get Current Timestamp.
    @return current timestamp.
    */
    function currentTimestamp() external view returns (uint256) {
        return block.timestamp;
    }

   /**
    @dev Checks if tokens are locked or not.
    @return status of the tokens.
    */
    function areTokensLocked(uint256 _voteId) external view returns (bool) {
        return
            votes[_voteId].lockedUntil > block.timestamp &&
            !votes[_voteId].released;
    }

   /**
    @dev Vote Info for a user.
    @param _voter address of voter
    @return Vote struct for the particular user id.
    */
    function getVotesForAddress(address _voter)
        external
        view
        returns (Vote[] memory)
    {
        uint256[] memory voteIds = voterToVoteIds[_voter];
        Vote[] memory votesForAddress = new Vote[](voteIds.length);
        for (uint256 i = 0; i < voteIds.length; i++) {
            votesForAddress[i] = votes[voteIds[i]];
        }
        return votesForAddress;
    }

   /**
    @dev Stake and get Voting rights.
    @param _grantId gitcoin grant id.
    @param _amount amount of tokens to lock.
    @param _lockedUntil lock duration.
    */
    function vote(
        uint256 _grantId,
        uint256 _amount,
        uint256 _lockedUntil
    ) public {
        if (_amount == 0) {
            revert INVALID_AMOUNT();
        }
        if (_lockedUntil <= block.timestamp) {
            revert INVALID_LOCK_DURATION();
        }

        gtcToken.transferFrom(msg.sender, address(this), _amount);

        uint256 voteId = votes.length;

        votes.push(
            Vote({
                voteId: voteId,
                voter: msg.sender,
                amount: _amount,
                grantId: _grantId,
                lockedSince: block.timestamp,
                lockedUntil: _lockedUntil,
                released: false
            })
        );

        voterToVoteIds[msg.sender].push(voteId);

        emit VoteCasted(
            voteId,
            msg.sender,
            _amount,
            _grantId,
            block.timestamp,
            _lockedUntil
        );
    }

   /**
    @dev Stake and get Voting rights in barch.
    @param _batch array of struct to stake into multiple grants.
    */
    function voteBatch(BatchVoteParam[] memory _batch) public {
        for (uint256 i = 0; i < _batch.length; i++) {
            vote(_batch[i].grantId, _batch[i].amount, _batch[i].lockedUntil);
        }
    }

   /**
    @dev Release tokens and give up votes.
    @param _voteId vote id.
    */
    function releaseTokens(uint256 _voteId) public {
        if (votes[_voteId].voter != msg.sender) {
            revert NOT_OWNER();
        }
        if (votes[_voteId].lockedUntil > block.timestamp) {
            revert LOCK_DURATION_NOT_OVER();
        }
        if (votes[_voteId].released != false) {
            revert TOKENS_ALREADY_RELAEASED();
        }
        votes[_voteId].released = true;
        gtcToken.transfer(msg.sender, votes[_voteId].amount);

        emit TokensReleased(msg.sender, votes[_voteId].amount);
    }
}
