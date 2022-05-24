// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract D4WEscrow is Ownable, ERC721URIStorage, ERC721Holder {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    address private dawNFT;
    
    // _items [ escrowId ] => dawTokenId
    mapping(uint256 => uint256) private _escrowItems;
    
    // _nftItems [ tokenId ] => escrowId
    mapping(uint256 => uint256) private _nftItems;

    // _escrow [ user ] [ dawTokenId ] => escrowId
    mapping(address => mapping(uint256 => uint256)) private _escrow;
    
    // _assetOwner [ escrowId ] => user
    mapping(uint256 => address) private _assetOwners;

    event Escrow(uint256 nftId, uint256 escrowId);
    event Withdraw(uint256 nftId, uint256 escrowId);

    constructor(address _NFT) ERC721("D4WNFT", "D4W") {
        dawNFT = _NFT;
    }

    function NFT() public view returns (address) {
        return dawNFT;
    }

    /**
     * @dev Reset NFT contract address
     * @param newContract NFT contract address
     */
    function setNFT(address newContract) public onlyOwner {
        dawNFT = newContract;
    }

    /**
     * @dev Create a token for the user
     * @param nftId NFT token id
     * @param _tokenURI token URI
     */
    function escrow(uint256 nftId, string memory _tokenURI) public returns (uint256) {
        IERC721(dawNFT).safeTransferFrom(msg.sender, address(this), nftId);

        
        _tokenIds.increment();
        uint256 escrowId = _tokenIds.current();

        _escrowItems[escrowId] = nftId;
        _nftItems[nftId] = escrowId;
        _escrow[msg.sender][nftId] = escrowId;
        _assetOwners[escrowId] = msg.sender;

        _safeMint(msg.sender, escrowId);
        _setTokenURI(escrowId, _tokenURI);

        emit Escrow(nftId, escrowId);

        return escrowId;
    }

    /**
     * @dev Is escrow for NFT token
     * @param nftId NFT token id
     */
    function isEscrow(uint256 nftId) public view returns (bool) {
        return _nftItems[nftId] > 0;
    }
    
    /**
     * @dev Withdraw NFT token from escrow, use NFT id (swap back)
     * @param nftId NFT id (uint256)
     */
    function withdraw(uint256 nftId) public {
        require(_nftItems[nftId] > 0, "NFT token not escrowed");
        require(_escrow[msg.sender][nftId] > 0, "Unavailable or Unauthorized");
        
        uint256 escrowId = _nftItems[nftId];

        // transfer to original owner
        IERC721(dawNFT).safeTransferFrom(address(this), msg.sender, nftId);
        
        // burn the escrowToken owned
        _burn(_escrow[msg.sender][nftId]);
        
        // clear states
        _escrowItems[escrowId] = 0;
        _nftItems[nftId] = 0;
        _escrow[msg.sender][nftId] = 0;
        _assetOwners[_escrow[msg.sender][nftId]] = address(0);

        emit Withdraw(nftId, escrowId);
    }

    /**
     * @dev Withdraw NFT token from escrow, use Escrow id
     * @param escrowId Escrow id (uint256)
     */
    function withdrawUseEscrow(uint256 escrowId) public {
        require(_escrowItems[escrowId] > 0, "NFT token not escrowed");
        uint256 nftId = _escrowItems[escrowId];

        require(_escrow[msg.sender][nftId] > 0, "Unavailable or Unauthorized");

        // transfer to original owner
        IERC721(dawNFT).safeTransferFrom(address(this), msg.sender, nftId);
        
        // burn the escrowToken owned
        _burn(_escrow[msg.sender][nftId]);
        
        // clear states
        _escrowItems[escrowId] = 0;
        _nftItems[nftId] = 0;
        _escrow[msg.sender][nftId] = 0;
        _assetOwners[_escrow[msg.sender][nftId]] = address(0);
        
        emit Withdraw(nftId, escrowId);
    }

    /**
     * @dev Reset URI to soecific token id
     * @param escrowId Escrow id (uint256)
     * @param _tokenURI Token URI
     */
    function setTokenURI(uint256 escrowId, string memory _tokenURI) public {
        _setTokenURI(escrowId, _tokenURI);
    }
}