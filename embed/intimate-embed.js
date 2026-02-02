// Intimate Systems - WebRenderer Embed Library
(function (global) {
    const DEFAULT_RPC = "https://ethereum-rpc.publicnode.com/";

    function encodeRoute(route) {
        const parts = route === "/" ? [] : route.replace(/^\//, "").split("/").filter(Boolean);
        const pad32 = (n) => n.toString(16).padStart(64, "0");
        const encodeString = (s) => {
            const bytes = new TextEncoder().encode(s);
            const hex = Array.from(bytes)
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("");
            const padded = hex.padEnd(Math.ceil(hex.length / 64) * 64 || 64, "0");
            return pad32(bytes.length) + padded;
        };

        // Encode string[] - calculate offsets relative to after the length field
        const encodedStrings = parts.map(encodeString);
        let strArrayData = pad32(parts.length); // length
        let offset = parts.length * 32; // first string starts after all offset slots
        for (const encoded of encodedStrings) {
            strArrayData += pad32(offset);
            offset += encoded.length / 2;
        }
        strArrayData += encodedStrings.join("");

        // Full calldata
        const selector = "1374c460";
        const offsetToStringArray = pad32(64); // 0x40
        const offsetToTupleArray = pad32(64 + strArrayData.length / 2); // after string array
        const tupleArrayData = pad32(0); // empty array

        return "0x" + selector + offsetToStringArray + offsetToTupleArray + strArrayData + tupleArrayData;
    }

    function decodeResponse(hex) {
        const b = new Uint8Array(
            hex
                .slice(2)
                .match(/.{2}/g)
                .map((x) => parseInt(x, 16)),
        );
        const v = new DataView(b.buffer);
        const status = Number(v.getBigUint64(24, false));
        const bodyOff = Number(v.getBigUint64(56, false));
        const bodyLen = Number(v.getBigUint64(bodyOff + 24, false));
        const body = new TextDecoder().decode(b.slice(bodyOff + 32, bodyOff + 32 + bodyLen));
        return { status, body };
    }

    async function fetchRoute(rpc, contract, route) {
        const res = await fetch(rpc, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "eth_call",
                params: [{ to: contract, data: encodeRoute(route) }, "latest"],
            }),
        });
        const json = await res.json();
        if (json.error) throw new Error(json.error.message);
        return decodeResponse(json.result);
    }

    function injectContent(iframe, html) {
        // Replace vh units with CSS variable
        const processed = html.replace(/(\d+)vh/g, 'calc(var(--vh, 1px) * $1)');
        const doc = iframe.contentDocument;
        doc.open();
        doc.write(processed);
        doc.close();
        // Set --vh to actual viewport height
        doc.documentElement.style.setProperty('--vh', window.innerHeight / 100 + 'px');
        doc.documentElement.style.overflow = 'hidden';
        doc.body.style.overflow = 'hidden';
    }

    function resizeToContent(iframe) {
        const doc = iframe.contentDocument;
        if (!doc || !doc.body) return;
        const height = Math.max(doc.body.scrollHeight, window.innerHeight);
        iframe.style.height = height + 'px';
    }

    // Process iframes in a document, loading their content from the contract
    async function processIframes(doc, rpc, contract) {
        const iframes = doc.querySelectorAll("iframe[src]");
        for (const iframe of iframes) {
            const src = iframe.getAttribute("src");
            if (!src || src.startsWith("http") || src.startsWith("//") || src.startsWith("data:")) continue;

            const route = src.startsWith("/") ? src : "/" + src;
            try {
                const { status, body } = await fetchRoute(rpc, contract, route);
                if (status === 200) {
                    const newFrame = document.createElement("iframe");
                    for (const attr of iframe.attributes) {
                        if (attr.name !== "src") newFrame.setAttribute(attr.name, attr.value);
                    }
                    iframe.replaceWith(newFrame);
                    injectContent(newFrame, body);
                    processIframes(newFrame.contentDocument, rpc, contract);
                    setupNavigation(newFrame.contentDocument, rpc, contract);
                    resizeToContent(newFrame);
                                    }
            } catch (e) {
                console.error("[intimate] Failed to load iframe:", src, e);
            }
        }
    }

    // Set up navigation interception for links
    function setupNavigation(doc, rpc, contract, onNavigate) {
        doc.addEventListener("click", (e) => {
            const a = e.target.closest("a");
            if (!a) return;
            const href = a.getAttribute("href");
            if (
                !href ||
                href.startsWith("http") ||
                href.startsWith("//") ||
                href.startsWith("#") ||
                href.startsWith("javascript:")
            )
                return;
            e.preventDefault();
            const route = href.startsWith("/") ? href : "/" + href;
            window.postMessage({ type: "intimate-nav", route }, "*");
        });
    }

    class IntimateEmbed {
        constructor({ container, contract, rpc = DEFAULT_RPC, route = "/", onNavigate }) {
            this.el = typeof container === "string" ? document.querySelector(container) : container;
            this.contract = contract;
            this.rpc = rpc;
            this.route = route;
            this.onNavigate = onNavigate;
            this.frame = document.createElement("iframe");
            this.frame.style.cssText = "width:100%;height:100%;border:none;";
            this.el.appendChild(this.frame);

            window.addEventListener("message", (e) => {
                if (e.data?.type === "intimate-nav") this.navigate(e.data.route);
            });

            window.addEventListener("resize", () => this.updateVh());

            this.navigate(route);
        }

        async navigate(route) {
            this.route = route;
            if (this.onNavigate) this.onNavigate(route);

            const { status, body } = await fetchRoute(this.rpc, this.contract, route);
            if (status === 404) {
                injectContent(this.frame, "<h1>404</h1>");
                return;
            }

            injectContent(this.frame, body);
            processIframes(this.frame.contentDocument, this.rpc, this.contract);
            setupNavigation(this.frame.contentDocument, this.rpc, this.contract);
            resizeToContent(this.frame);
        }

        updateVh() {
            const doc = this.frame.contentDocument;
            if (!doc) return;
            doc.documentElement.style.setProperty('--vh', window.innerHeight / 100 + 'px');
            resizeToContent(this.frame);
        }
    }

    IntimateEmbed.fetch = (contract, route, rpc = DEFAULT_RPC) => fetchRoute(rpc, contract, route);
    global.IntimateEmbed = IntimateEmbed;
})(window);
