pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

import "./CrossChain.sol";

import { ICrossDomainMessenger } from 
    "@eth-optimism/contracts/libraries/bridge/ICrossDomainMessenger.sol";

contract cvGTC is ERC20, Ownable, CrossChain {

  /// @notice address of the BG Bridge token contract instance on L1
  address public bgBridge;

  /// @notice address of the BG Reverse Bridge token contract instance on L2
  address public bgReverseBridge;

  /// @notice address of the Conviction Voting contract on L2
  address public cvContract;

  constructor() ERC20("Conviction Voting Gitcoin","cvGTC") {
  }

  function mint(address _to, uint256 _amount) external onlyBridge {
    require(_amount > 0, "Amount must be greater than 0");
    _mint(_to, _amount);
  }

  function burn(address _account, uint256 _amount) external onlyReverseBridge {
    require(_amount > 0, "Amount must be greater than 0");
    _burn(_account, _amount);
  }

  /**
  @dev Sets the address of the L2 bridge
  @param _bgReverseBridge The address of the bridge contract on L2
  */
  function setBGReverseBridge(address _bgReverseBridge) external onlyOwner {
    bgReverseBridge = _bgReverseBridge;
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

  modifier onlyReverseBridge() {
    require(getXorig() == bgReverseBridge, "Only the bridge can call this function");
    _;
  }

}