import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Entry, Label } from "webgen/mod.ts";
import { AdminWallet, API, stupidErrorAlert } from "../../../spec/mod.ts";
import { BasicEntry } from "shared/components.ts";

await RegisterAuthRefresh();

const wallets = asRef<AdminWallet[] | "loading">("loading");

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
        wallets.map((wallets) => wallets === "loading" ? Label("Loading...") : wallets.map((wallet) =>
            Entry(BasicEntry(`${wallet.userName} - ${((wallet.balance?.restrained ?? 0) + (wallet.balance?.unrestrained ?? 0)).toFixed(2).toString()}`,
                `${wallet.email} - ${wallet.user} - ${wallet._id} - ${wallet.cut}% - ${wallet.balance?.restrained.toFixed(2)}/${wallet.balance?.unrestrained.toFixed(2)}`,
            ))),
        ),
    ),
);
