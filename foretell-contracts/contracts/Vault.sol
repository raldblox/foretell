// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error InvalidFactory();
error NotFactory();
error AmountMustBeGreaterThanZero();
error InvalidProof();
error AlreadyClaimed();

contract OpenSurveyRewardVault {
    using SafeERC20 for IERC20;

    address public immutable factory;
    uint256 public immutable surveyId;

    mapping(address => bytes32) public merkleRootPerToken;
    mapping(address => mapping(address => uint256)) public claimedPerToken;

    event Funded(address indexed from, address indexed token, uint256 amount);
    event Claimed(address indexed user, address indexed token, uint256 amount);
    event MerkleRootUpdated(address indexed token, bytes32 indexed newRoot);

    modifier onlyFactory() {
        if (msg.sender != factory) revert NotFactory();
        _;
    }

    constructor(uint256 _surveyId, address _factory) {
        if (_factory == address(0)) revert InvalidFactory();
        surveyId = _surveyId;
        factory = _factory;
    }

    function fund(address token, uint256 amount) external {
        if (amount == 0) revert AmountMustBeGreaterThanZero();
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        emit Funded(msg.sender, token, amount);
    }

    function setMerkleRoot(
        address token,
        bytes32 newRoot
    ) external onlyFactory {
        merkleRootPerToken[token] = newRoot;
        emit MerkleRootUpdated(token, newRoot);
    }

    function claim(
        address token,
        uint256 totalEntitled,
        bytes32[] calldata proof
    ) external {
        address user = msg.sender;
        bytes32 leaf = keccak256(abi.encode(user, totalEntitled));
        if (!MerkleProof.verify(proof, merkleRootPerToken[token], leaf)) {
            revert InvalidProof();
        }

        uint256 alreadyClaimed = claimedPerToken[user][token];
        if (totalEntitled <= alreadyClaimed) revert AlreadyClaimed();

        uint256 claimable = totalEntitled - alreadyClaimed;
        claimedPerToken[user][token] = totalEntitled;

        IERC20(token).safeTransfer(user, claimable);
        emit Claimed(user, token, claimable);
    }

    function getClaimable(
        address user,
        address token,
        uint256 totalEntitled
    ) external view returns (uint256) {
        return totalEntitled - claimedPerToken[user][token];
    }
}
