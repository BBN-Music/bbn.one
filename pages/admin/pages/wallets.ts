import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Label } from "webgen/mod.ts";
import { API, stupidErrorAlert, Wallet } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const wallets = asRef<Wallet[] | "loading">("loading");

createPage(
    {
        route: createRoute({
            path: "/admin?list=wallets",
            events: {
                onLazyInit: async () => {
                    wallets.setValue(await API.getWalletsByAdmin().then(stupidErrorAlert));
                },
            },
        }),
        label: "Wallets",
        weight: 7,
    },
    Content(
        wallets.map((wallets) => wallets === "loading" ? Label("Loading...") : wallets.map((wallet) => Label(wallet.user + " " + ((wallet.balance?.restrained ?? 0) + (wallet.balance?.unrestrained ?? 0))))),
    ),
);
