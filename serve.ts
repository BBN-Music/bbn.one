import { serve } from "https://deno.land/x/esbuild_serve@1.5.0/mod.ts";
import { exists } from "jsr:@std/fs@1.0.5";
import { createClient, defaultPlugins } from "npm:@hey-api/openapi-ts";

let url = "https://bbn.one/openapi";
await fetch("http://localhost:8443/openapi", {
    timeout: 1000,
}).then(() => url = "http://localhost:8443/openapi").catch(() => {});

await createClient({
    input: await exists("openapi.json") ? "openapi.json" : url,
    output: "spec/gen",
    plugins: [
        ...defaultPlugins,
        "@hey-api/client-fetch",
        "zod",
        {
            name: "@hey-api/sdk",
            validator: true,
        },
    ],
});
function fixImports(path: string) {
    Deno.writeTextFileSync(
        path,
        Deno.readTextFileSync(path)
            .replaceAll(".gen';", ".gen.ts';")
            .replaceAll("'zod';", "'zod/mod.ts';"),
    );
}
["spec/gen/sdk.gen.ts", "spec/gen/zod.gen.ts"].forEach(fixImports);
Deno.removeSync("spec/gen/index.ts");

const title = new Map(Object.entries({
    "index": "BBN Music",
    "admin": "BBN Admin",
    "admin/review": "BBN Music - Review Drop",
    "settings": "BBN - Settings",
    "wallet": "BBN Wallet",
    "music": "BBN Music",
    "c/music": "BBN Music - Console",
    "c/music/new-drop": "BBN Music - New Drop",
    "c/music/edit": "BBN Music - Edit Drop",
    "c/music/payout": "BBN Music - Payouts",
    "p/privacy-policy": "BBN - Privacy Policy",
    "p/terms-of-use": "BBN - Terms of Use",
    "p/imprint": "BBN - Imprint",
    "p/distribution-agreement": "BBN - Distribution Agreement",
}));

const description = new Map(Object.entries({
    "default": "BBN Music, your gateway to unlimited music distribution at a low cost. Maximize your reach without limits. Join us and let the world hear your music.",
}));

serve({
    port: 6969,
    extraLoaders: {
        ".webp": "file",
        ".jpg": "file",
    },
    assets: {
        "sitemap.xml": "./static/sitemap.xml",
        "robots.txt": "./static/robots.txt",
        "mitm.html": "./static/mitm.html",
        "sw.js": "./static/sw.js",
        "favicon.ico": "./static/favicon.ico",
        "email-header.png": "./static/email-header.png",
        "app.webmanifest": "./static/app.webmanifest",
        ".well-known/passkey-endpoints": "./static/.well-known/passkey-endpoints",
        "images/icons/icon-72x72.png": "./static/images/icons/icon-72x72.png",
        "images/icons/icon-96x96.png": "./static/images/icons/icon-96x96.png",
        "images/icons/icon-128x128.png": "./static/images/icons/icon-128x128.png",
        "images/icons/icon-144x144.png": "./static/images/icons/icon-144x144.png",
        "images/icons/icon-152x152.png": "./static/images/icons/icon-152x152.png",
        "images/icons/icon-192x192.png": "./static/images/icons/icon-192x192.png",
        "images/icons/icon-384x384.png": "./static/images/icons/icon-384x384.png",
        "images/icons/icon-512x512.png": "./static/images/icons/icon-512x512.png",
        "images/apple.png": "./static/images/apple.png",
    },
    pages: {
        "index": "./pages/landing/main.ts",
        "p/privacy-policy": "./pages/landing/legal/privacyPolicy.ts",
        "p/terms": "./pages/landing/legal/terms.ts",
        "p/imprint": "./pages/landing/legal/imprint.ts",
        "signin": "./pages/user/signin.ts",
        "callback": "./pages/misc/callback.ts",
        // "oauth": "./pages/user/oauth.ts",
        "c/music": "./pages/music/main.ts",
        "c/music/new-drop": "./pages/music/newDrop.ts",
        "c/music/edit": "./pages/edit/main.ts",
        // "c/music/payout": "./pages/payout/main.ts",
        "settings": "./pages/user/settings.ts",
        "admin": "./pages/admin/main.ts",
        // "admin/review": "./pages/admin/review.ts",
        "wallet": "./pages/wallet/wallet.ts",
        // "share": "./pages/music/share.ts",
    },
    defaultTemplate: createTemplate,
    poylfills: [
        "./polyfill.ts",
        "./bug-reporter.ts",
        "https://cdn.jsdelivr.net/npm/native-file-system-adapter@3.0.1/mod.js",
        "https://unpkg.com/urlpattern-polyfill@10.0.0/index.js",
        "https://esm.sh/@virtualstate/navigation@1.0.1-alpha.206/polyfill",
    ],
});

function createTemplate(name: string, path: string) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <title>${title.get(path) ?? "BBN Music"}</title>
    <link rel="manifest" href="/app.webmanifest">
    <meta charset='UTF-8'>
    <meta name="description" content="${description.get(path) ?? description.get("default")}">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name='theme-color' content='black'>
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="${title.get(path) ?? "BBN Music"}">
    <meta name="google" content="notranslate"/>
    <link rel="me" href="https://chaos.social/@bbn">
    <link rel="apple-touch-icon" href="/images/apple.png">
    <link rel="stylesheet" href="${name}.css">
    <script defer data-domain="bbn.one" src="https://pl.bbn.one/js/script.js"></script>
</head>

<body>
    <script src="${name}.js" type="module"></script>
</body>

</html>
    `.trim();
}
