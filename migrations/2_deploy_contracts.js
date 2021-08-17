const Instachain = artifacts.require("Instachain");

module.exports = function (deployer) {
  deployer.deploy(Instachain)
};