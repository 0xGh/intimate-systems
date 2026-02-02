# Intimate Systems Embed

A small script to embed the Intimate Systems show page in your site. Fetches directly from Ethereum client-side.

## Files

- `intimate-embed.js` - Embeddable library for rendering WebRenderer contracts (this should be used on your website)
- `test.html` - Test page for local development (example usage of the above)
- `DeployLocal.s.sol` - Forge script to deploy contracts locally

## Using intimate-embed.js

```html
<script src="intimate-embed.js"></script>
<script>
    const embed = new IntimateEmbed({
        container: "#my-container",
        contract: "0x...",
        rpc: "http://127.0.0.1:8545",
        route: "/",
        onNavigate: (route) => console.log("navigated to", route),
    });
</script>
```

See [test.html](./test.html) for a full integration example.

In production use `https://ethereum-rpc.publicnode.com` as `rcp`.

## Local Development

Local development environment for testing the WebRenderer.

### Quick Start

1. Start anvil with mainnet fork:

```bash
anvil --fork-url https://ethereum-rpc.publicnode.com --disable-block-gas-limit --host 0.0.0.0 --port 8545
```

2. Deploy contracts:

```bash
forge script embed/DeployLocal.s.sol --rpc-url http://127.0.0.1:8545 --broadcast --private-key <privatekey>
```

3. Copy the WEBRENDERER ADDRESS from the output.

4. Open `embed/test.html` in a browser, enter:
    - RPC: `http://127.0.0.1:8545`
    - Contract: the WebRenderer address from step 3
