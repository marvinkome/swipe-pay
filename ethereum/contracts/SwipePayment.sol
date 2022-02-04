// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SwipePayment is Ownable, ReentrancyGuard {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address feeAddress;
    uint256 depositFee; // between 1 to 1000

    mapping(address => mapping(address => uint256)) public users;

    event ReceivePayment(
        address indexed user,
        address tokenAddress,
        address to,
        uint256 amount
    );
    event WithdrawFunds(
        address indexed user,
        address tokenAddress,
        address indexed to,
        uint256 amount
    );
    event SetFeeAddress(address indexed user, address indexed newAddress);
    event SetDepositFee(address indexed user, uint256 newFee);

    function receivePayment(
        address _tokenAddress, // token address
        address _to, // receiver address
        uint256 _amount
    ) external nonReentrant {
        uint256 balanceBefore = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).safeTransferFrom(
            address(msg.sender),
            address(this),
            _amount
        );

        _amount = IERC20(_tokenAddress).balanceOf(address(this)).sub(
            balanceBefore
        );
        require(_amount > 0, "we dont accept deposits of 0");

        if (depositFee > 0 && feeAddress != address(0)) {
            uint256 fees = _amount.mul(depositFee).div(1000);
            IERC20(_tokenAddress).safeTransfer(feeAddress, fees);
            users[_to][_tokenAddress] = users[_to][_tokenAddress]
                .add(_amount)
                .sub(fees);
        } else {
            users[_to][_tokenAddress] = users[_to][_tokenAddress].add(_amount);
        }

        emit ReceivePayment(msg.sender, _tokenAddress, _to, _amount);
    }

    function withdrawFunds(
        address _from, // withdrawer address
        address _tokenAddress // token address
    ) external nonReentrant onlyOwner {
        require(users[_from][_tokenAddress] > 0, "insufficient funds");

        uint256 amount = users[_from][_tokenAddress];
        users[_from][_tokenAddress] = 0;

        IERC20(_tokenAddress).safeTransfer(_from, amount);
        emit WithdrawFunds(msg.sender, _tokenAddress, _from, amount);
    }

    function setFeeAddress(address _feeAddress) external onlyOwner {
        require(_feeAddress != address(0), "!nonzero");
        feeAddress = _feeAddress;

        emit SetFeeAddress(msg.sender, _feeAddress);
    }

    function setDepositFee(uint16 _depositFee) external onlyOwner {
        require(_depositFee > 0, "set: invalid deposit fee");
        depositFee = _depositFee;

        emit SetDepositFee(msg.sender, _depositFee);
    }
}
