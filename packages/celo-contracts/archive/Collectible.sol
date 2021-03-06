// contracts/Collectible.sol
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./interfaces/IMarket.sol";

contract Collectible is AccessControl, Ownable, ERC721Burnable, ERC721Pausable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    struct CreatorShare {
        // Address of the creator
        address creatorAddress;
        // Percentage of shares received by the creator
        uint8 share;
    }

    // Available roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 private constant MINT_BATCH_LIMIT = 64;

    Counters.Counter private _tokenIdTracker;

    // Contract address of the Market contract that can access this collectible
    address private _marketAddress;

    // Max number of tokens for the collectible
    uint256 private _maxNumTokens;

    // Commission percentage received by the market
    uint8 private _commissionPercentage;

    // Royalty percentage received by the creator of the collectible
    uint8 private _royaltyPercentage;

    // Indicates if any token of this collectible has been sold
    bool private _hasTokenSold;

    // A mapping of all creators of this collectible and their respective shares
    // Chose a mapping instead of an array for ease of change in values.
    mapping(uint256 => CreatorShare) private _creatorShares;

    // Current number of creators.
    // Used to properly index through the {_creatorShares} mapping
    uint256 private _numOfCreators;

    /**
     * @dev Validates and sets initial values for the collectible config
     *
     * Grants {DEFAULT_ADMIN_ROLE}, {MINTER_ROLE} and {PAUSER_ROLE} to the
     * account that deploys the contract.
     *
     * Token URIs will be autogenerated based on {baseURI} and their token IDs.
     *
     * Mints all tokens upon contract deployment.
     */
    constructor(
        address marketAddress,
        string memory name,
        string memory baseTokenURI,
        uint256 maxNumTokens,
        uint8 rPercentage,
        uint8 cPercentage,
        address[] memory creators,
        uint8[] memory creatorShares,
        uint256 price,
        bool isAuction,
        uint256 auctionStartTime,
        uint256 auctionEndTime
    ) ERC721(name, "monofu-art") {
        // Adding validation to ensure valid configuration
        require(marketAddress != address(0), "Collectible: Invalid address");
        require(
            rPercentage + cPercentage < 100,
            "Collectible: Commission and royalty rate must be less than 100"
        );
        require(
            creators.length == creatorShares.length,
            "Collectible: Creator and shares list not equal lengths"
        );

        uint256 total = uint256(0);
        for (uint256 i = 0; i < creators.length; i++) {
            require(creators[i] != address(0), "Collectible: Invalid address");
            _creatorShares[i] = CreatorShare({
                creatorAddress: creators[i],
                share: creatorShares[i]
            });
            total += creatorShares[i];
        }
        require(total == 100, "Collectible: Creator shares must total to 100");
        if (auctionStartTime > 0 && auctionEndTime > 0) {
            require(
                auctionStartTime < auctionEndTime,
                "Collectible: Invalid start and end date range"
            );
        }

        _marketAddress = marketAddress;
        _maxNumTokens = maxNumTokens;
        _royaltyPercentage = rPercentage;
        _commissionPercentage = cPercentage;
        _numOfCreators = creators.length;
        _hasTokenSold = false;

        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setBaseURI(baseTokenURI);

        IMarket(marketAddress).putOnSaleInitial(
            price,
            isAuction,
            auctionStartTime,
            auctionEndTime
        );

        uint256 numMint = maxNumTokens;
        if (maxNumTokens > MINT_BATCH_LIMIT) {
            numMint = MINT_BATCH_LIMIT;
        }
        for (uint256 i = 0; i < numMint; i++) {
            // Increment first because we are starting with id 1
            _tokenIdTracker.increment();
            _safeMint(_msgSender(), _tokenIdTracker.current());
        }
    }

    /**
     * @dev Mints next batch of tokens based on {_maxNumTokens}
     * Only used in contract creation.
     *
     * Requirements:
     * - the caller must have the {MINTER_ROLE}.
     * - the total number of tokens has not exceeded the {_maxNumTokens}
     */
    function bulkMintTokens() public {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "Collectible: Must have minter role to mint"
        );
        require(
            totalSupply() <= _maxNumTokens,
            "Collectible: Max tokens reached"
        );

        uint256 remainingSupply = _maxNumTokens.sub(totalSupply());
        if (remainingSupply > MINT_BATCH_LIMIT) {
            remainingSupply = MINT_BATCH_LIMIT;
        }
        for (uint256 i = 0; i < remainingSupply; i++) {
            // Increment first because we are starting with id 1
            _tokenIdTracker.increment();
            _safeMint(_msgSender(), _tokenIdTracker.current());
        }
    }

    /**
     * @dev Creates a new token for `to`. Its token ID will be automatically
     * assigned (and available on the emitted {IERC721-Transfer} event), and the token
     * URI autogenerated based on the base URI passed at construction.
     *
     * Requirements:
     * - the caller must have the {MINTER_ROLE}.
     * - the total number of tokens has not exceeded the {_maxNumTokens}
     */
    function mint(address to) public virtual {
        require(
            hasRole(MINTER_ROLE, _msgSender()),
            "Collectible: Must have minter role to mint"
        );
        require(
            totalSupply() <= _maxNumTokens,
            "Collectible: Max tokens reached"
        );

        // Increment first because we are starting with id 1
        _tokenIdTracker.increment();
        _safeMint(to, _tokenIdTracker.current());
    }

    /**
     * @dev Pauses all token transfers.
     *
     * Requirements:
     * - the caller must have the {PAUSER_ROLE}.
     */
    function pause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "Collectible: Must have pauser role to pause"
        );

        _pause();
    }

    /**
     * @dev Unpauses all token transfers.
     *
     * Requirements:
     * - the caller must have the {PAUSER_ROLE}.
     */
    function unpause() public virtual {
        require(
            hasRole(PAUSER_ROLE, _msgSender()),
            "Collectible: Must have pauser role to unpause"
        );

        _unpause();
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721, ERC721Pausable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`.
     *
     * Requirements:
     *
     * - {tokenId} must exist.
     */
    function _isApprovedOrOwnerOrMarket(address spender, uint256 tokenId)
        internal
        view
        returns (bool)
    {
        return (_isApprovedOrOwner(spender, tokenId) ||
            spender == _marketAddress);
    }

    /**
     * @dev See {IERC721-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory _data
    ) public virtual override {
        require(
            _isApprovedOrOwnerOrMarket(_msgSender(), tokenId),
            "ERC721: Transfer caller is not owner nor approved"
        );

        _safeTransfer(from, to, tokenId, _data);
    }

    /**
     * @dev Returns the market address that has access to this collectible
     * set during construction.
     */
    function getMarketAddress() public view returns (address) {
        return _marketAddress;
    }

    /**
     * @dev Returns the commission percentage set via {setCommissionPercentage}.
     */
    function getCreatorShares()
        public
        view
        returns (address[] memory, uint8[] memory)
    {
        address[] memory addrs = new address[](_numOfCreators);
        uint8[] memory shares = new uint8[](_numOfCreators);

        for (uint256 i = 0; i < _numOfCreators; i++) {
            CreatorShare storage share = _creatorShares[i];
            addrs[i] = share.creatorAddress;
            shares[i] = share.share;
        }

        return (addrs, shares);
    }

    /**
     * @dev Returns the royalty percentage set via {setRoyaltyPercentage}.
     */
    function getRoyaltyPercentage() public view returns (uint8) {
        return _royaltyPercentage;
    }

    /**
     * @dev Returns the commission percentage set via {setCommissionPercentage}.
     */
    function getCommissionPercentage() public view returns (uint8) {
        return _commissionPercentage;
    }

    /**
     * @dev Function to set the creator shares list
     *
     * Requirements:
     * - the caller must be the original creator of the collectible
     */
    function setCreatorShares(
        address[] memory creators,
        uint8[] memory creatorShares
    ) public {
        require(
            _msgSender() == owner(),
            "Collectible: Caller must be the creator of the collectible"
        );
        require(
            creators.length == creatorShares.length,
            "Collectible: Creator and shares list not equal lengths"
        );

        uint256 total = uint256(0);
        for (uint256 i = 0; i < creators.length; i++) {
            require(creators[i] != address(0), "Collectible: Invalid address");
            _creatorShares[i] = CreatorShare({
                creatorAddress: creators[i],
                share: creatorShares[i]
            });
            total += creatorShares[i];
        }
        require(total == 100, "Collectible: Creator shares must total to 100");

        _numOfCreators = creators.length;
    }

    /**
     * @dev Function to set the royalty percentage of the collectible.
     *
     * Requirements:
     * - the caller must be the original creator of the collectible.
     */
    function setRoyaltyPercentage(uint8 percentage) public {
        require(
            _msgSender() == owner(),
            "Collectible: Caller must be the creator of the collectible"
        );
        require(
            !_hasTokenSold,
            "Collectible: Can't update once a token has been sold"
        );
        require(
            percentage + _commissionPercentage < 100,
            "Collectible: Commission and royalty rate must be less than 100"
        );
        _royaltyPercentage = percentage;
    }

    /**
     * @dev Function to set the commission percentage of the collectible.
     *
     * Requirements:
     * - the caller must come from the Market contract address.
     */
    function setCommissionPercentage(uint8 percentage) public {
        require(
            _msgSender() == _marketAddress,
            "Collectible: Caller must be the Market"
        );
        require(
            !_hasTokenSold,
            "Collectible: Can't update once a token has been sold"
        );
        require(
            percentage + _royaltyPercentage < 100,
            "Collectible: Commission and royalty rate must be less than 100"
        );
        _commissionPercentage = percentage;
    }

    /**
     * @dev Function to transfer the token to the new owner.
     *
     * Requirements:
     * - the caller must come from the Market contract address.
     */
    function marketTransfer(uint256 tokenId, address recipient) external {
        address tokenOwner = ownerOf(tokenId);

        require(
            _msgSender() == _marketAddress,
            "Collectible: Caller must be the Market"
        );

        safeTransferFrom(tokenOwner, recipient, tokenId);
        _hasTokenSold = true;
    }
}
