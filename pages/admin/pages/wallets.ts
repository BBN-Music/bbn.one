import { RegisterAuthRefresh } from "shared/helper.ts";
import { Content, createPage, createRoute, Label } from "webgen/mod.ts";

await RegisterAuthRefresh();

createPage(
    {
        route: createRoute({
            path: "/admin?list=wallets",
        }),
        label: "Wallets",
        weight: 7,
    },
    Content(
        Label("test"),
    ),
);
