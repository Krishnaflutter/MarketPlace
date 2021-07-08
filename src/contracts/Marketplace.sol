pragma solidity ^0.5.0;

contract Marketplace {
    string public name;
    
    // EVM limitation we cannot know the count of products inside mapping 
    // therefore this variable helps us keep a count of products inside mapping
    uint public productCount = 0;

    // key - value pair of products , here key is ID in Product
    mapping(uint => Product) public products;



    // A product will  have these properties
    struct Product { 
        uint id;
        string name;
        uint price;
        address payable owner;
        bool purchased;
    }

    // Creating an event , later used to trigger
    event productCreated(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    event productSold(
        uint id,
        string name,
        uint price,
        address payable owner,
        bool purchased
    );

    constructor() public {
        name = "Dapp University Marketplace";
    }

    function createProduct(string memory _name , uint _price) public {
        // This function does these things :
        // Make sure parameters of product are correct
        // Requires a valid name
        require(bytes(_name).length > 0);
        
        // Requires a valid price
        require(_price > 0);
        
        // Increment Product count
        productCount++;
        
        // Create the product
        products[productCount]=Product(productCount,_name,_price , msg.sender , false);
        
        // Trigger an event 
        emit productCreated(productCount,_name,_price , msg.sender , false);
    }

    function productPurchased(uint _id) public payable {
        // Fetch the product
        Product memory _product = products[_id];
        
        // Fetch the owner
        address payable _seller = _product.owner;
        
        // Make sure product is valid & product not already purchased 
        require(_product.id > 0 && _product.id <= productCount);
        require(!_product.purchased);
        require(msg.value >= _product.price);
        require(_seller != msg.sender);
        
        
        //Transfer owner-ship of produt
        _product.owner = msg.sender;
        
        
        // Mark as purchased
        _product.purchased=true;
        
        
        // Update the product changes to the mapping
        products[_id]=_product;
        
        
        // pay the seller by sending them crypto
        address(_seller).transfer(msg.value);

        
        // trigger an event 
        emit productSold(_product.id, _product.name, _product.price, _product.owner, true);
    }
}

