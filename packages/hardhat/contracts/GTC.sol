pragma solidity >=0.8.0 <0.9.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/Ownable.sol

contract GTC is ERC20 {

  constructor() ERC20("Gitcoin","GTC") {
    _mint(msg.sender,10000 ether);
  }

  function mint(address _to, uint256 _amount) external {
    require(_amount > 0, "Amount must be greater than 0");
    _mint(_to, _amount);
  }

}
