pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

// For cross domain messages' origin
import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

contract cvGTC is ERC20, Ownable {

  /// @notice address of the BG Bridge token contract instance on L1
  address bgBridge;

  /// @notice address of the Conviction Voting contract on L2
  address cvContract;

  constructor() ERC20("Conviction Voting Gitcoin","cvGTC") {
  }

  function mint(address _to, uint256 _amount) external onlyBridge {
    require(_amount > 0, "Amount must be greater than 0");
    _mint(_to, _amount);
  }

  /**
  @dev Sets the address of the L1 bridge
  @param _bgBridge The address of the bridge contract on L1
  */
  function setBGBridge(address _bgBridge) external onlyOwner {
    bgBridge = _bgBridge;
  }

  /**
  @dev Sets the address of the L1 bridge
  @param _cvContract The address of the Conviction Voting contract on L2
  */
  function setCV(address _cvContract) external onlyOwner {
    cvContract = _cvContract;
  }

   /**
  * @dev See {IERC20-transfer}.
  */
  function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
      require(recipient == cvContract, "Recipient must be the Conviction Voting contract");
      _transfer(_msgSender(), recipient, amount);
      return true;
  }

  modifier onlyBridge() {
    require(getXorig() == bgBridge, "Only the bridge can call this function");
    _;
  }

  // Get the cross domain origin, if any
  function getXorig() private view returns (address) {
    // Get the cross domain messenger's address each time.
    // This is less resource intensive than writing to storage.
    address cdmAddr = address(0);    

    if (block.chainid == 1)
      cdmAddr = 0x25ace71c97B33Cc4729CF772ae268934F7ab5fA1;

    // Kovan
    if (block.chainid == 42)
      cdmAddr = 0x4361d0F75A0186C05f971c566dC6bEa5957483fD;

    // L2
    if (block.chainid == 10 || block.chainid == 69)
      cdmAddr = 0x4200000000000000000000000000000000000007;

    // If this isn't a cross domain message
    if (msg.sender != cdmAddr)
      return address(0);

    // If it is a cross domain message, find out where it is from
    return ICrossDomainMessenger(cdmAddr).xDomainMessageSender();
  }    // getXorig()

}