import { RegisterAuthRefresh } from "shared/helper.ts";
import { BasicEntry } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, Entry } from "webgen/mod.ts";
import { AdminWallet, API, Payout, stupidErrorAlert } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const wallets = asRef<AdminWallet[]>([]);

export const overviewPage = createPage(
    {
        route: createRoute({
            path: "/admin?list=overview",
            events: {
                onLazyInit: async () => {
                    wallets.setValue(await API.getWalletsByAdmin().then(stupidErrorAlert));
                },
            },
        }),
        label: "Overview",
        weight: 1,
    },
    Content(
        Box(wallets.map((wallets) =>
            Entry(
                BasicEntry("BBN Revenue", `£ ${Object.values(wallets.find((w) => w.user === "62ea6fa5321b3702e93ca21c")?.balance ?? {}).reduce((a, b) => a + b, 0)}`),
            )
        )),
    ),
);
