// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/IntimateSystems.sol";
import "../src/web/WebRenderer.sol";
import "../src/Mod.sol";
import "../src/Essay.sol";

// Deploy against a mainnet fork:
// anvil --fork-url https://ethereum-rpc.publicnode.com --disable-block-gas-limit --host 0.0.0.0 --port 8545
contract DeployLocal is Script {
    function run() external {
        vm.startBroadcast();

        Mod data = new Mod();
        Essay essay = new Essay();

        // Mainnet sculpture addresses
        Sculpture[] memory sculptures = new Sculpture[](1);
        sculptures[0] = Sculpture(0x82752f2626AC2FBF2A8b7781a1c20cbcab2E0196);
        // sculptures[1] = Sculpture(0x69B2D2AA0274CB21A3a80c0e53C84de551e97390);
        // sculptures[2] = Sculpture(0x93510d88036b3a128c5f0B4782E13969adE745a1);
        // sculptures[3] = Sculpture(0xEc5AB17Cc35221cdF54EaEb0868eA82d4D75D9Bf);
        // sculptures[4] = Sculpture(0x22FEA2F6b2154859630011d9A38648171CA0D972);
        // sculptures[5] = Sculpture(0x9c3622C8BF55A0350D9cf732211726dFCB67E1C2);
        // sculptures[6] = Sculpture(0xC2C9157dDa7dBE3049d185f887986C8ccC31C0f5);
        // sculptures[7] = Sculpture(0x3D3Be9ED59622202cAA06B8B5CDf3fE1AD933240);
        // sculptures[8] = Sculpture(0x00000063266aAAeDD489e4956153855626E44061);

        SculptureERC721[] memory sculptureERC721s = new SculptureERC721[](1);
        sculptureERC721s[0] = SculptureERC721(0x82752f2626AC2FBF2A8b7781a1c20cbcab2E0196, 1);
        // sculptureERC721s[1] = SculptureERC721(0x69B2D2AA0274CB21A3a80c0e53C84de551e97390, 1);
        // sculptureERC721s[2] = SculptureERC721(0xcf2bF523f1FCb1aA9e9896E56F097AADC9087c5e, 1);
        // sculptureERC721s[3] = SculptureERC721(0x73469b3f8b9DEb8dC15724Dee8919Aac98605782, 0);
        // sculptureERC721s[4] = SculptureERC721(0x22FEA2F6b2154859630011d9A38648171CA0D972, 1);
        // sculptureERC721s[5] = SculptureERC721(0x09CA1D7D0419d444AdFbb2c47FF0b2F29f29D3B2, 2);
        // sculptureERC721s[6] = SculptureERC721(0x9f1866E72Cf7C7F14CBd481e099CB4EAe919274B, 1);
        // sculptureERC721s[7] = SculptureERC721(0x3D3Be9ED59622202cAA06B8B5CDf3fE1AD933240, 0);
        // sculptureERC721s[8] = SculptureERC721(0x00000063266aAAeDD489e4956153855626E44061, 0);

        data.setText(
            "<p>Intimate Systems explores the quiet, interior spaces that exist within networks designed for visibility. On-chain art is inherently public and permanent, yet beneath this transparency, subtle gestures, private signals, and traces of human presence persist.</p>"
            "<p>This exhibition highlights works that examine how individuality, perception, and expression survive within structured systems of code, logic, and networks. Artists consider how small, intimate interactions such as a pause, a repeated pattern, or a hidden mark can shape presence and meaning in digital environments.</p>"
            "<p>The works on view engage with systems as material, revealing rhythm, behavior, and nuance through abstraction, participation, and generative logic. Some invite collaboration, while others quietly encode human traces into their architecture. Across these approaches, the exhibition foregrounds presence over sentiment, and structure over illustration.</p>"
            "<p>Following a lineage of artists who translate logic into expression, from Vera Molnar and Manfred Mohr to JODI, Jenny Holzer, and contemporary practitioners like Sarah Friend and Lauren Lee McCarthy, Intimate Systems demonstrates how code and networks can be simultaneously rigorous and resonant.</p>"
            "<p>By tracing the subtle circulation of human signals through visible systems, the exhibition reveals the architectures of thought, reflection, and relation that thrive beneath the surface of digital networks.</p>"
        );

        IntimateSystems show = new IntimateSystems(
            sculptures,
            sculptureERC721s,
            WebRenderer(address(0)),
            data
        );

        WebRenderer renderer = new WebRenderer(
            address(show),
            address(essay),
            address(data)
        );

        vm.stopBroadcast();

        console.log("Mod deployed at:", address(data));
        console.log("Essay deployed at:", address(essay));
        console.log("IntimateSystems deployed at:", address(show));
        console.log("");
        console.log("========================================");
        console.log("WEBRENDERER ADDRESS:", address(renderer));
        console.log("========================================");
    }
}
