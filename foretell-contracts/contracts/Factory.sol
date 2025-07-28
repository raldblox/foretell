// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Vault.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error VaultAlreadyExists();

contract OpenSurveyVaultFactory is Ownable(msg.sender) {
    mapping(uint256 => address) public vaults;

    event VaultCreated(uint256 indexed surveyId, address vault);

    function createVault(uint256 surveyId) external onlyOwner {
        if (vaults[surveyId] != address(0)) revert VaultAlreadyExists();
        OpenSurveyRewardVault vault = new OpenSurveyRewardVault(
            surveyId,
            address(this)
        );
        vaults[surveyId] = address(vault);
        emit VaultCreated(surveyId, address(vault));
    }

    function getVault(uint256 surveyId) external view returns (address) {
        return vaults[surveyId];
    }

    function setVaultMerkleRoot(
        uint256 surveyId,
        address token,
        bytes32 newRoot
    ) external onlyOwner {
        OpenSurveyRewardVault(vaults[surveyId]).setMerkleRoot(token, newRoot);
    }
}
