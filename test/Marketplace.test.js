const { assert } = require("chai");
require('chai').use(require('chai-as-promised')).should()

const Marketplace = artifacts.require("./Marketplace.sol");

contract('Marketplace', ([deployer , seller , buyer])=>{
    let marketplace;

    before(async ()=>{
        marketplace = await Marketplace.deployed()
    })

    describe('deployment' , async () => {
        it('deploys successfully !!' , async () => {
            const address = await marketplace.address;
            assert.notEqual(address,0x0);
            assert.notEqual(address,'');
            assert.notEqual(address,null);
            assert.notEqual(address,undefined);
        })
        
        it('has a name' , async () => {
            const name = await marketplace.name()
            assert.equal(name,"Dapp University Marketplace");
        })
    })

    describe('Products' , async () => {
        let result , productCount;

        before(async () => {
            result = await marketplace.createProduct('iPhone X',web3.utils.toWei('1','Ether'),{from : seller});
            productCount = await marketplace.productCount()
        })

        
        it('Creates product !!' , async () => {
            // Success
            assert.equal(productCount,1);
            // console.log(result.logs);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct');
            assert.equal(event.name ,'iPhone X','name is correct');
            assert.equal(event.price , web3.utils.toWei('1','Ether'),'price is correct');
            assert.equal(event.owner , seller ,'owner is correct');
            assert.equal(event.purchased ,false,'purchaseds is correct');

            // Failure
            // passing empty string as name
            await await marketplace.createProduct('',web3.utils.toWei('1','Ether'),{from:seller}).should.be.rejected;
            // passing price as 0 , not valid
            await await marketplace.createProduct('iPhone X',web3.utils.toWei('0','Ether'),{from:seller}).should.be.rejected;
            
        })

        it('Lists product !!' , async () => {
            // Success
            // console.log(result.logs);
            const product = await marketplace.products(productCount);
            // console.log(product);
            assert.equal(product.id.toNumber(),productCount.toNumber(),'id is correct');
            assert.equal(product.name ,'iPhone X','name is correct');
            assert.equal(product.price , web3.utils.toWei('1','Ether'),'price is correct');
            assert.equal(product.owner , seller ,'owner is correct');
            assert.equal(product.purchased ,false,'purchaseds is correct');
        })

        it('Selling product !!' , async () => {
            
            // Track the seller balance before purchase
            let oldsellerBalance = await web3.eth.getBalance(seller)
            oldsellerBalance = new web3.utils.BN(oldsellerBalance);
            //Buyer make purchase
            result = await marketplace.productPurchased(
                productCount,
                { from: buyer, value: web3.utils.toWei('1','Ether')}
            );

            //check logs
            // console.log(result.logs);
            const event = result.logs[0].args;
            assert.equal(event.id.toNumber(),productCount.toNumber(),'id is correct');
            assert.equal(event.name ,'iPhone X','name is correct');
            assert.equal(event.price , web3.utils.toWei('1','Ether'),'price is correct');
            assert.equal(event.owner , buyer ,'owner is correct');
            assert.equal(event.purchased , true ,'purchaseds is correct');

            // Check seller received the funds 
            let newsellerBalance = await web3.eth.getBalance(seller);
            newsellerBalance = new web3.utils.BN(newsellerBalance);
            
            // Price paid for product
            let price 
            price = await web3.utils.toWei('1')
            price = new web3.utils.BN(price)
            
            const expectedBalance = oldsellerBalance.add(price)

            assert.equal(newsellerBalance.toString(), expectedBalance.toString())
                
            // Failure
            await await marketplace.productPurchased(
                0,
                { from: buyer, value: web3.utils.toWei('1','Ether')}
            ).should.be.rejected;
                
            await await marketplace.productPurchased(
                productCount,
                { from: seller, value: web3.utils.toWei('1','Ether')}
            ).should.be.rejected;

            await await marketplace.productPurchased(
                productCount,
                { from: deployer, value: web3.utils.toWei('1','Ether')}
            ).should.be.rejected;

            await await marketplace.productPurchased(
                0,
                { from: buyer, value: web3.utils.toWei('1','shannon')}
            ).should.be.rejected;
            
            
        
        })


    })

})