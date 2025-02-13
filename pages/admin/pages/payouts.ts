import { sumOf } from "@std/collections";
import { BasicEntry } from "shared/components.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Empty, Entry } from "webgen/mod.ts";
import { API, PayoutList, stupidErrorAlert } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const payouts = asRef<PayoutList[] | "loading">("loading");

createPage(
    {
        route: createRoute({
            path: "/admin?list=payouts",
            events: {
                onLazyInit: async () => {
                    payouts.setValue(await API.getPayoutsByAdmin().then(stupidErrorAlert));
                },
            },
        }),
        label: "Payouts",
        weight: 5,
    },
    Content(
        payouts.map((payoutsdata) =>
            payoutsdata === "loading" ? [Empty()] : payoutsdata.map((payouts) =>
                Entry(BasicEntry(payouts.period, `£ ${payouts.sum}`))
            )
        ),
    ),
);
