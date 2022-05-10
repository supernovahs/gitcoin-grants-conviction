pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 
import "./CrossChain.sol";
import "./GTC.sol";

// Errors
error INVALID_AMOUNT();

/**
@title BG Bridge Contract
@notice Lock GTC tokens on L1 to mint cvGTC tokens on L2
*/
contract BGBridge is Ownable, CrossChain {
  event Bridged(
      address sender,
      uint256 amount
  );

  event Unbridged(
      address receiver,
      uint256 amount
  );

  /// @notice The address of the cross domain messenger on Kovan
  // Find it with `curl http://localhost:8080/addresses.json`
  address crossDomainMessengerAddr = 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318;

  /// @notice GTC token contract instance
  GTC public immutable gtcToken;

  /// @notice address of the cvGTC token contract instance on L2
  address public l2cvGTC;

  /// @notice address of the BGReverseBridge contract instance on L2
  address public bgReverseBridge;

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
  @dev Sets the address of the L2 reverse bridge
  @param _bgReverseBridge The address of the contract on L2
  */
  function setReverseBridge(address _bgReverseBridge) external onlyOwner {
    bgReverseBridge = _bgReverseBridge;
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

  /**
  @dev Unbridge GTC tokens to cvGTC tokens
  @param _amount amount of tokens to unbridge
  */
  function unbridge(address _address, uint256 _amount) external onlyReverseBridge {
      if (_amount == 0) {
          revert INVALID_AMOUNT();
      }
      require (addressToLockedAmount[_address] >= _amount, "Not enough tokens to unbridge");
      
      gtcToken.transferFrom(address(this), _address, _amount);

      emit Unbridged(_address, _amount);
  }

  modifier onlyReverseBridge() {
    require(getXorig() == bgReverseBridge, "Only the bridge can call this function");
    _;
  }

}
