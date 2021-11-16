// contracts/Collectible.sol
// SPDX-License-Identifier: Apache-2.0
/**
 * NOTE: This file was influenced by the Zora AuctionHouse.sol contract.
 * The reference was https://github.com/ourzora/auction-house/blob/main/contracts/AuctionHouse.sol at commit
 * d87346f9286130af529869b8402733b1fabe885b
 *
 * The auction flow was copied and simplified to suit the project needs.
 */
pragma solidity ^0.7.5;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IMarket.sol";
import "./Collectible.sol";

contract Market is IMarket, Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct Auction {
        // The time when the auction will start
        uint256 startTime;
        // The time when the auction will end
        uint256 endTime;
        // The minimum price of the first bid
        uint256 reservePrice;
        // The current highest bid amount
        uint256 amount;
        // The address of the current highest bid
        address bidder;
    }

    // Address of the currency used by the Market
    IERC20 private _stableToken;

    // Address of the recipient of all revenue commissions
    address private _commissionRecipient;

    // A mapping of all co-admins in the Market
    mapping(address => bool) private _coAdmins;

    // A mapping of all of the auctions.
    // _auctions[tokenAddress][tokenId]
    mapping(address => mapping(uint256 => Auction)) private _auctions;

    // A mapping of all tokens for instant sale.
    // _tokenPrices[tokenAddress][tokenId]
    mapping(address => mapping(uint256 => uint256)) private _tokenPrices;

    // A mapping of initial prices set by the collectible owner on deployment.
    // This price is applied to all token ids
    // _tokenInitialPrices[tokenAddress]
    mapping(address => uint256) private _tokenInitialPrices;

    // A mapping to prevent setting default prices once the initial price is set
    // _initialPriceSet[tokenAddress]
    mapping(address => bool) private _initialPriceSet;

    /**
     * @dev Initializes the contract by setting the stabletoken and
     * commission recipient addresses
     */
    constructor(address stableTokenAddress, address commissionRecipient) {
        _stableToken = IERC20(stableTokenAddress);
        _commissionRecipient = commissionRecipient;
    }

    /**
     * @dev Require that the caller is the owner or a co-admin
     */
    modifier onlyAdmin() {
        require(
            _msgSender() == owner() || _coAdmins[_msgSender()],
            "Market: Caller is not an admin"
        );
        _;
    }

    /**
     * @dev Require that the collectible's market address is this
     */
    modifier hasAccess(address tokenContract) {
        require(
            tokenContract != address(0),
            "Market: Invalid collectible contract address"
        );
        require(
            Collectible(tokenContract).getMarketAddress() == address(this),
            "Market: No access to selected collectible"
        );
        _;
    }

    /**
     * @dev Require that the specified token is on sale
     */
    modifier isOnSale(address tokenContract, uint256 tokenId) {
        require(
            _tokenPrices[tokenContract][tokenId] != 0 ||
                _tokenInitialPrices[tokenContract] != 0,
            "Market: Token not for sale"
        );
        _;
    }

    /**
     * @dev Require that the specified token has an auction
     */
    modifier hasAuction(address tokenContract, uint256 tokenId) {
        require(
            _auctions[tokenContract][tokenId].startTime != 0,
            "Market: Auction does not exists"
        );
        _;
    }

    /**
     * @dev Add address to the list of coAdmins.
     *
     * Requirements:
     * - the caller must be an admin of the Market.
     */
    function addCoAdmin(address userAddress) public onlyAdmin nonReentrant {
        _coAdmins[userAddress] = true;
    }

    /**
     * @dev Remove address from the list of coAdmins.
     *
     * Requirements:
     * - the caller must be an admin of the Market.
     */
    function removeCoAdmin(address userAddress) public onlyAdmin nonReentrant {
        delete _coAdmins[userAddress];
    }

    /**
     * @dev Returns the commission recipient set via {setCommissionRecipient}.
     *
     * Requirements:
     * - the caller must be an admin of the Market.
     */
    function getCommissionRecipient() public view onlyAdmin returns (address) {
        return _commissionRecipient;
    }

    /**
     * @dev Set a new recipient for commissions.
     *
     * Requirements:
     * - the caller must be an admin of the Market.
     */
    function setCommissionRecipient(address commissionRecipient)
        public
        onlyAdmin
        nonReentrant
    {
        _commissionRecipient = commissionRecipient;
    }

    /**
     * @dev Set the commission percentage of a collectible.
     *
     * Requirements:
     * - the caller must be an admin of the Market.
     * - the Market has access to the collectible.
     */
    function setCommissionPercentage(address tokenContract, uint8 percentage)
        public
        onlyAdmin
        hasAccess(tokenContract)
        nonReentrant
    {
        Collectible(tokenContract).setCommissionPercentage(percentage);
    }

    /**
     * @dev Handles division of the royalty fee to the Collectible's creators
     * based on their shares.
     */
    function _handleRoyaltyDistribution(
        address tokenContract,
        uint256 royaltyAmount
    ) internal {
        (address[] memory addr, uint8[] memory shares) = Collectible(
            tokenContract
        ).getCreatorShares();
        for (uint256 i = 0; i < addr.length; i++) {
            uint256 shareProfit = royaltyAmount.mul(shares[i]).div(100);
            _stableToken.safeTransfer(addr[i], shareProfit);
        }
    }

    /**
     * @dev Calculates the values for the commission fees and royalty fees
     * and sends the value to the correct recipients. Sends the remaining
     * amount to the tokenOwner and transfer the ownership of the token to
     * the buyer.
     */
    function _handlePaymentAndTokenTransfers(
        address tokenContract,
        uint256 tokenId,
        uint256 amount,
        address tokenOwner,
        address recipient
    ) internal {
        address contractOwner = Collectible(tokenContract).owner();
        uint8 commissionPercentage = Collectible(tokenContract)
            .getCommissionPercentage();
        uint8 royaltyPercentage = Collectible(tokenContract)
            .getRoyaltyPercentage();

        uint256 commissionFee = amount.mul(commissionPercentage).div(100);
        // Commission fee
        _stableToken.safeTransfer(_commissionRecipient, commissionFee);

        if (contractOwner == tokenOwner) {
            uint256 firstSalePayment = amount.sub(commissionFee);
            _handleRoyaltyDistribution(tokenContract, firstSalePayment);
        } else {
            uint256 royaltyFee = amount.mul(royaltyPercentage).div(100);
            uint256 payment = amount.sub(commissionFee).sub(royaltyFee);
            // Royalty fee to item creators
            _handleRoyaltyDistribution(tokenContract, royaltyFee);
            // Payment to token owner
            _stableToken.safeTransfer(tokenOwner, payment);
        }

        // Transfer token to new owner
        Collectible(tokenContract).marketTransfer(tokenId, recipient);
    }

    /**
     * @dev Transfer the amount to this contract.
     */
    function _handleIncomingPayment(uint256 amount) internal {
        uint256 beforeBalance = _stableToken.balanceOf(address(this));
        _stableToken.safeTransferFrom(_msgSender(), address(this), amount);
        uint256 afterBalance = _stableToken.balanceOf(address(this));

        require(
            beforeBalance.add(amount) == afterBalance,
            "Market: Token transfer call did not transfer expected amount"
        );
    }

    /**
     * @dev Sends the bid back to the previous highest bidder.
     */
    function _handleOutgoingBid(address to, uint256 amount) internal {
        _stableToken.safeTransfer(to, amount);
    }

    /**
     * @dev Returns the token price set via {putOnSale}.
     */
    function getTokenOnSalePrice(address tokenContract, uint256 tokenId)
        public
        view
        isOnSale(tokenContract, tokenId)
        returns (uint256)
    {
        if (_tokenPrices[tokenContract][tokenId] != 0) {
            return _tokenPrices[tokenContract][tokenId];
        }
        return _tokenInitialPrices[tokenContract];
    }

    /**
     * @dev Returns the auction max bid or reserve price set via {createAuction}
     * and {createBid}.
     */
    function getAuctionCurrentPrice(address tokenContract, uint256 tokenId)
        public
        view
        hasAuction(tokenContract, tokenId)
        returns (uint256)
    {
        uint256 amount = _auctions[tokenContract][tokenId].amount;

        if (amount == 0) {
            return _auctions[tokenContract][tokenId].reservePrice;
        }
        return amount;
    }

    /**
     * @dev Returns the auction current highest bidder set via {createBid}
     */
    function getAuctionCurrentBidder(address tokenContract, uint256 tokenId)
        public
        view
        hasAuction(tokenContract, tokenId)
        returns (address)
    {
        return _auctions[tokenContract][tokenId].bidder;
    }

    /**
     * @dev Puts a default price for all tokens on sale or
     * create an auction for the first token.
     * Called by the Collectible contract upon deployment
     *
     * Requirements:
     * - can only be called once.
     */
    function putOnSaleInitial(
        uint256 price,
        bool isAuction,
        uint256 startTime,
        uint256 endTime
    ) external override nonReentrant {
        require(
            !_initialPriceSet[_msgSender()],
            "Market: Initial price already set"
        );

        if (isAuction && price > 0) {
            // Only create an initial auction for the first token
            _auctions[_msgSender()][1] = Auction({
                startTime: startTime,
                endTime: endTime,
                reservePrice: price,
                amount: uint256(0),
                bidder: address(0)
            });
        } else if (price > 0) {
            // Set a default initial price for all tokens
            _tokenInitialPrices[_msgSender()] = price;
        }
        // set to true even if the price was 0 to prevent being called again
        _initialPriceSet[_msgSender()] = true;
    }

    /**
     * @dev Puts a token id belonging to the {tokenContract} for sale.
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the caller must be the owner of the token.
     */
    function putOnSale(
        address tokenContract,
        uint256 tokenId,
        uint256 price
    ) external hasAccess(tokenContract) nonReentrant {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);

        require(
            tokenOwner == _msgSender(),
            "Market: Caller must be the owner of the token"
        );
        require(price > 0, "Market: Price must be greater than 0");

        _tokenPrices[tokenContract][tokenId] = price;
    }

    /**
     * @dev Purchase the token
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the token is on sale.
     * - the caller must not be the owner of the token.
     */
    function purchaseToken(address tokenContract, uint256 tokenId)
        external
        hasAccess(tokenContract)
        isOnSale(tokenContract, tokenId)
        nonReentrant
    {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);
        uint256 tokenPrice;
        if (_tokenPrices[tokenContract][tokenId] != 0) {
            tokenPrice = _tokenPrices[tokenContract][tokenId];
        } else {
            tokenPrice = _tokenInitialPrices[tokenContract];
        }

        require(
            tokenOwner != _msgSender(),
            "Market: Token already owned by you"
        );

        _handleIncomingPayment(tokenPrice);
        _handlePaymentAndTokenTransfers(
            tokenContract,
            tokenId,
            tokenPrice,
            tokenOwner,
            _msgSender()
        );
    }

    /**
     * @dev Create an auction for the token
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the caller must be the owner of the token.
     */
    function createAuction(
        address tokenContract,
        uint256 tokenId,
        uint256 startTime,
        uint256 endTime,
        uint256 reservePrice
    ) external hasAccess(tokenContract) nonReentrant {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);

        require(
            _msgSender() == tokenOwner,
            "Market: Caller must be the owner of the token"
        );
        require(
            startTime < endTime,
            "Market: Invalid start and end date range"
        );

        _auctions[tokenContract][tokenId] = Auction({
            startTime: startTime,
            endTime: endTime,
            reservePrice: reservePrice,
            amount: uint256(0),
            bidder: address(0)
        });
    }

    /**
     * @dev Place a bid for a token.
     * Refunds the bid of the previous bidder if any
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the token has an auction
     * - the auction should be ongoing
     * - the caller must not be the owner of the token.
     * - the amount should be higher than the previous bid or the reserve price.
     */
    function createBid(
        address tokenContract,
        uint256 tokenId,
        uint256 amount
    )
        external
        hasAccess(tokenContract)
        hasAuction(tokenContract, tokenId)
        nonReentrant
    {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);
        address lastBidder = _auctions[tokenContract][tokenId].bidder;

        require(
            block.timestamp >= _auctions[tokenContract][tokenId].startTime,
            "Market: Auction has not started yet"
        );
        require(
            block.timestamp < _auctions[tokenContract][tokenId].endTime,
            "Market: Auction has already ended"
        );
        require(
            tokenOwner != _msgSender(),
            "Market: Token already owned by you"
        );
        require(
            amount >= _auctions[tokenContract][tokenId].reservePrice,
            "Market: Must send at least the reserve price"
        );
        require(
            amount > _auctions[tokenContract][tokenId].amount,
            "Market: Must send more than last bid"
        );

        _handleIncomingPayment(amount);
        if (lastBidder != address(0)) {
            _handleOutgoingBid(
                lastBidder,
                _auctions[tokenContract][tokenId].amount
            );
        }
        _auctions[tokenContract][tokenId].amount = amount;
        _auctions[tokenContract][tokenId].bidder = _msgSender();
    }

    /**
     * @dev End the auction of the token, handing all payments and transferring
     * ownership of the token to latest bidder.
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the token has an auction.
     * - the auction should have already ended.
     * - the caller must be the owner of the token.
     */
    function endAuction(address tokenContract, uint256 tokenId)
        external
        hasAccess(tokenContract)
        hasAuction(tokenContract, tokenId)
        nonReentrant
    {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);
        uint256 amount = _auctions[tokenContract][tokenId].amount;
        address winner = _auctions[tokenContract][tokenId].bidder;

        require(
            block.timestamp >= _auctions[tokenContract][tokenId].endTime,
            "Market: Auction has not ended"
        );
        require(
            tokenOwner == _msgSender(),
            "Market: Caller must be the owner of the token"
        );

        if (winner != address(0)) {
            _handlePaymentAndTokenTransfers(
                tokenContract,
                tokenId,
                amount,
                tokenOwner,
                winner
            );
        }
        delete _auctions[tokenContract][tokenId];
    }

    /**
     * @dev Cancel the auction of the token.
     *
     * Requirements:
     * - the Market has access to the collectible.
     * - the token has an auction.
     * - the caller must be the owner of the token.
     * - the auction has not received any bids.
     */
    function cancelAuction(address tokenContract, uint256 tokenId)
        external
        hasAccess(tokenContract)
        hasAuction(tokenContract, tokenId)
        nonReentrant
    {
        address tokenOwner = Collectible(tokenContract).ownerOf(tokenId);

        require(
            tokenOwner == _msgSender(),
            "Market: Caller must be the owner of the token"
        );
        require(
            _auctions[tokenContract][tokenId].amount == 0,
            "Market: Can't cancel an auction once a bid has already been placed"
        );

        delete _auctions[tokenContract][tokenId];
    }
}
