pragma solidity ^0.5.0;

contract Instachain {
    string public name = "Instachain";
    string public nickname = "ImageApp";

    // Store Post
    uint public imageCount = 0;
    mapping(uint => Image) public images;

    struct Image{
        uint id;
        string hashValue;
        string description;
        uint tip; 
        address payable author;
    }

    event ImageCreated(
        uint id,
        string hashValue,
        string description,
        uint tip,
        address payable author
    );
    event ImageTipped(
        uint id,
        string hashValue,
        string description,
        uint tip,
        address payable author
    );


    // Create Post
    function uploadImage(string memory _hashValue, string memory _description) public {
        require(bytes(_hashValue).length > 0 );
        require(bytes(_description).length > 0 );
        require(msg.sender != address(0x0));

        imageCount++;
        images[imageCount] = Image(imageCount,_hashValue, _description,0, msg.sender);

        emit ImageCreated(imageCount,_hashValue, _description,0, msg.sender);
    }

    // Tip Post

    function tipping(uint _id ) public payable {
        require(_id > 0 && _id <= imageCount);

        Image memory _image = images[_id];

        address payable _author =  _image.author;
        address(_author).transfer(msg.value);
        _image.tip = _image.tip + msg.value;

        images[_id] = _image;

        emit ImageTipped(_id, _image.hashValue, _image.description, _image.tip, _author);
    }
}