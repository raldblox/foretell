const { ethers } = require("hardhat");

async function main() {
  const OpenSurveyVaultFactory = await ethers.getContractFactory(
    "OpenSurveyVaultFactory"
  );
  const factory = await OpenSurveyVaultFactory.deploy();

  console.log("OpenSurveyVaultFactory deployed to:", factory.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
