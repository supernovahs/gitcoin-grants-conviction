pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "./GTC.sol";

// Errors
error INVALID_AMOUNT();

/**
@title BG Bridge Contract
@notice Lock GTC tokens on L1 to mint cvGTC tokens on L2
*/
contract BGBridge is Ownable {
  event Bridged(
      address sender,
      uint256 amount
  );

  /// @notice The address of the cross domain messenger on Kovan
  address crossDomainMessengerAddr = 0x4361d0F75A0186C05f971c566dC6bEa5957483fD;

  /// @notice GTC token contract instance
  GTC immutable gtcToken;

  /// @notice address of the cvGTC token contract instance on L2
  address l2cvGTC;

  /// @notice mapping that tracks the amount of GTC tokens locked for each user
  mapping(address => uint256) public addressToLockedAmount;

  /**
  @dev Constructor
  @param _tokenAddress GTC token address
  */
  constructor(address _tokenAddress) payable {
    gtcToken = GTC(_tokenAddress);
  }

  /**
  @dev Sets the address of the L2 contract
  @param _l2cvGTC The address of the cvGTC contract on L2
  */
  function setL2TokenContract(address _l2cvGTC) external onlyOwner {
    l2cvGTC = _l2cvGTC;
  }

  /**
  @dev Bridge GTC tokens to cvGTC tokens 
  @param _amount amount of tokens to lock and bridge
  */
  function bridge(uint256 _amount) external {
      if (_amount == 0) {
          revert INVALID_AMOUNT();
      }

      gtcToken.transferFrom(msg.sender, address(this), _amount);

      bytes memory message = abi.encodeWithSignature("mint(address,uint256)", msg.sender, _amount);

      ICrossDomainMessenger(crossDomainMessengerAddr).sendMessage(
            l2cvGTC,
            message,
            1000000 // within the free gas limit amount
        );

      addressToLockedAmount[msg.sender] += _amount;

      emit Bridged(msg.sender, _amount);      
  }

}
