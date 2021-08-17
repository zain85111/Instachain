const { assert } = require('chai')

const Instachain = artifacts.require('./Instachain.sol')

require('chai').use(require('chai-as-promised')).should()

contract('Instachain', ([deployer, author, tipper]) => {
  let instachain

  before(async () => {
    instachain = await Instachain.deployed() 
  })

  describe('deployment', async () => {
    it('deployed successfully', async () => {
      const address = await instachain.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('Name is valid', async () => {
      const name = await instachain.name()
      assert.equal(name, 'Instachain')
    })
    it('NickName is valid', async () => {
      const name = await instachain.nickname()
      assert.equal(name, 'ImageApp')
      assert.notEqual(name,"")
    })
  })

  describe('images', async () => {
    let result, imageCount;
    const hash = "sddpvknw";

    before(async () => {
      result = await instachain.uploadImage(hash, "Sample Desc", { from: author })
      imageCount = await instachain.imageCount();
    })
    
    it("create image", async () => {
      assert.equal(imageCount, 1);
      const event = result.logs[0].args;
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hashValue, hash, 'Hash is correct')
      assert.equal(event.description, 'Sample Desc', 'description is correct')
      assert.equal(event.tip, '0', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct');

      await instachain.uploadImage("", "Sampple Desc", { from: author }).should.be.rejected;
      await instachain.uploadImage("sddpvknw", "", { from: author }).should.be.rejected;
    })

    it("listing images", async () => {
      const image = await instachain.images(imageCount);
      assert.equal(image.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(image.hashValue, hash, 'Hash is correct')
      assert.equal(image.description, 'Sample Desc', 'description is correct')
      assert.equal(image.tip, '0', 'tip amount is correct')
      assert.equal(image.author, author, 'author is correct');
    })


    it('tipping images', async () => {
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      result = await instachain.tipping(imageCount, { from: tipper, value: web3.utils.toWei('1', 'Ether') });

      const event = result.logs[0].args
      assert.equal(event.id.toNumber(), imageCount.toNumber(), 'id is correct')
      assert.equal(event.hashValue, hash, 'Hash is correct')
      assert.equal(event.description, 'Sample Desc', 'description is correct')
      assert.equal(event.tip, '1000000000000000000', 'tip amount is correct')
      assert.equal(event.author, author, 'author is correct');

      let newAuthorBalance
      newAuthorBalance = await web3.eth.getBalance(author)
      newAuthorBalance = new web3.utils.BN(newAuthorBalance)

      let tipping
      tipping = web3.utils.toWei('1', 'Ether')
      tipping = new web3.utils.BN(tipping)

      const expectedBalance = oldAuthorBalance.add(tipping)

      assert.equal(newAuthorBalance.toString(), expectedBalance.toString())

      await instachain.tipping(99, { from: tipper, value: web3.utils.toWei('1', 'Ether')}).should.be.rejected;
    })

  })
})