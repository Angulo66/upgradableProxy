// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

// Transparent upgradeable proxy contract

contract CounterV1 {
    uint256 public count;

    function increment() external {
        count += 1;
    }

    function admin() external pure returns (address) {
        return address(1);
    }

    function implementation() external pure returns (address) {
        return address(2);
    }
}

contract CounterV2 {
    uint256 public count;

    function increment() external {
        count += 1;
    }

    function decrement() external {
        count -= 1;
    }

    function admin() external pure returns (address) {
        return address(1);
    }

    function implementation() external pure returns (address) {
        return address(2);
    }
}

contract Proxy {
    // address public implementation;
    // address public admin;
    bytes32 private constant IMPLEMENTATION_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.implementation")) - 1); // using openzeppelin's implementation of EIP1967 proxy standard

    bytes32 private constant ADMIN_SLOT =
        bytes32(uint256(keccak256("eip1967.proxy.admin")) - 1); // -1 for random string

    constructor() {
        //implementation = _implementation;
        //admin = msg.sender;
        _setAdmin(msg.sender);
    }

    function _delegate(address _implementation) private {
        // (bool success, bytes memory returnData) = implementation.delegatecall(
        //     msg.data
        // );
        // require(success, "Delegatecall failed");
        // return(add(returnData, 0x20), mload(returnData))
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(
                gas(),
                _implementation,
                0,
                calldatasize(),
                0,
                0
            )
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    function _fallback() private {
        _delegate(_getImplementation());
    }

    fallback() external payable {
        _fallback();
    }

    receive() external payable {
        _fallback();
    }

    modifier ifAdmin() {
        if (msg.sender == _getAdmin()) {
            _;
        } else {
            _fallback();
        }
    }

    function upgradeTo(address _implementation) external ifAdmin {
        //require(msg.sender == _getAdmin(), "only admin");
        _setImplementation(_implementation);
        //implementation = _implementation;
    }

    function _getImplementation() public view returns (address) {
        return StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value;
    }

    function _setImplementation(address _implementation) internal {
        // check if the implementation is a contract
        require(
            _implementation.code.length > 0,
            "Implementation is not a contract"
        );
        StorageSlot.getAddressSlot(IMPLEMENTATION_SLOT).value = _implementation;
    }

    function _getAdmin() public view returns (address) {
        return StorageSlot.getAddressSlot(ADMIN_SLOT).value;
    }

    function _setAdmin(address _admin) internal {
        // check if the admin is not a zero address
        require(_admin != address(0), "Admin is the zero address");
        StorageSlot.getAddressSlot(ADMIN_SLOT).value = _admin;
    }

    function implementation() external ifAdmin returns (address) {
        return _getImplementation();
    }

    function admin() external ifAdmin returns (address) {
        return _getAdmin();
    }
}

library StorageSlot {
    struct AddressSlot {
        address value;
    }

    function getAddressSlot(bytes32 slot)
        internal
        pure
        returns (AddressSlot storage r)
    {
        assembly {
            r.slot := slot
        }
    }
}

contract TestSlot {
    bytes32 public constant SLOT = keccak256("TEST_SLOT");

    function getSlot() public view returns (address) {
        return StorageSlot.getAddressSlot(SLOT).value;
    }

    function writeSlot(address _addr) external {
        StorageSlot.getAddressSlot(SLOT).value = _addr;
    }
}
