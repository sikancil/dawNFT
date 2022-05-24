// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract D4WNFT is Ownable, ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    /**
     * @dev Minters
     * @dev _items[ userAddress ] = tokenId
     */
    mapping(address => uint256[]) private _items;

    /**
     * @dev Fee Whitelist
     * _feeWhitelist[ userAddress ] = state
     */
    mapping(address => bool) private _feeWhitelist;

    /**
     * @dev Minting fee
     */
    uint256 private _mintFee;

    event Whitelisted(address minter, bool state);

    constructor() ERC721("D4WNFT", "D4W") {
        _mintFee = 0.01 ether;
    }

    receive () external payable {}
    fallback () external payable {}

    /**
     * @dev Return all minted tokens by the minter (creator)
     * @param _minter minter address
     * @return [] token Ids
     */
    function minted(address _minter) public view returns (uint256[] memory) {
        return _items[_minter];
    }

    /**
     * @dev Set the new minted token to the minters
     * @param _tokenId New minted token id
     */
    function _update(uint256 _tokenId) internal {
        _items[msg.sender].push(_tokenId);
    }

    /**
     * @dev Get the minting fee
     * @return fee as ether (wei unit)
     */
    function mintFee() public view returns (uint256) {
        return _mintFee;
    }
    
    /**
     * @dev Set the minting fee. (!) only owner
     * @param _fee as ether (wei unit)
     */
    function setMintFee(uint256 _fee) public onlyOwner returns (uint256) {
        return _mintFee = _fee;
    }

    /**
     * @dev Get is address in whitelist.
     * @param _minter address
     * @return bool
     */
    function isWhitelisted(address _minter) public view returns (bool) {
        return _feeWhitelist[_minter];
    }

    /**
     * @dev Set address in whitelist.
     * @param _minter address
     * @param state bool
     * !emit Whitelisted(address _minter, bool state)
     */
    function whitelist(address _minter, bool state) public onlyOwner {
        _feeWhitelist[_minter] = state;
        emit Whitelisted(_minter, state);
    }

    /**
     * @dev Mint (create) a token for the user. If user address is not whitelisted, will pay the fee.
     * @param _tokenURI token URI
     * !value fee as ether (wei unit)
     * @return tokenId
     */
    function mint(string memory _tokenURI) public payable returns (uint256) {
        // Apply fee if not in whitelist
        uint256 chargeFee = _feeWhitelist[msg.sender] ? 0 : _mintFee;
        if (chargeFee > 0) {
            require(msg.value >= chargeFee, "Insufficient fee");
            (bool ok, ) = payable(address(this)).call{value: chargeFee}("");
            require(ok, "Failed to pay fee");
        }

        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _tokenURI);
        _update(tokenId);

        return tokenId;
    }

    /**
     * @dev Reset URI to soecific token id
     * @param tokenId Token id (uint256)
     * @param _tokenURI Token URI
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) public {
        _setTokenURI(tokenId, _tokenURI);
    }
}