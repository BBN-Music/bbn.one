import { RegisterAuthRefresh } from "shared/helper.ts";
import { Content, createPage, createRoute, Label } from "webgen/mod.ts";

await RegisterAuthRefresh();

createPage(
    {
        route: createRoute({
            path: "/admin?list=payouts",
        }),
        label: "Payouts",
        weight: 5,
    },
    Content(
        Label("test"),
    ),
);
