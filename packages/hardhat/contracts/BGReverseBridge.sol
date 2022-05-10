pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "./CrossChain.sol";
import "./cvGTC.sol";

// Errors
error INVALID_AMOUNT();

/**
@title BG Bridge Contract
@notice Lock GTC tokens on L1 to mint cvGTC tokens on L2
*/
contract BGReverseBridge is Ownable, CrossChain {
  event Bridged(
      address sender,
      uint256 amount
  );

    /// @notice The address of the cross domain messenger on Kovan
  address crossDomainMessengerAddr = 0x0000000000000000000000000000000000000000;

  /// @notice address of the cvGTC token contract instance on L2
  cvGTC public l2cvGTC;

  /// @notice address of the BGBridge contract instance on L1
  address public bgBridge;

 /**
  @dev Constructor
  @param _tokenAddress cvGTC token address
  */
  constructor(address _tokenAddress) payable {
    l2cvGTC = cvGTC(_tokenAddress);
  }

  /**
  @dev Sets the address of the L1 bridge
  @param _bgBridge The address of the contract on L2
  */
  function setBridge(address _bgBridge) external onlyOwner {
    bgBridge = _bgBridge;
  }

    /**
  @dev Unbridge cvGTC tokens to GTC tokens 
  @param _amount amount of tokens to lock and bridge
  */
  function unBridge(uint256 _amount) external {
      if (_amount == 0) {
          revert INVALID_AMOUNT();
      }

      l2cvGTC.burn(msg.sender, _amount);

      bytes memory message = abi.encodeWithSignature("unbridge(address,uint256)", msg.sender, _amount);

      ICrossDomainMessenger(crossDomainMessengerAddr).sendMessage(
            bgBridge,
            message,
            1000000 // within the free gas limit amount
        );

      emit Bridged(msg.sender, _amount);      
  }
}
