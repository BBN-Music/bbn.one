import { sumOf } from "@std/collections";
import { BasicEntry } from "shared/components.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Empty, Entry } from "webgen/mod.ts";
import { API, Payout, stupidErrorAlert } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const payouts = asRef<Payout[][] | "loading">("loading");

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
                Entry(BasicEntry(
                    payouts[0].period,
                    `£ ${sumOf(payouts, (payout) => sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.revenue))).toFixed(2)}`,
                    // children: payouts.map((payout) => ({
                    //     title: payout._id,
                    //     subtitle: `£ ${sumOf(payout.entries, (entry) => sumOf(entry.data, (data) => data.revenue)).toFixed(2)}`,
                    //     id: `payouts${payouts[0].period}${payout._id}`,
                    //     children: payout.entries.map((entry) => ({
                    //         title: entry.isrc,
                    //         id: `payouts${payouts[0].period}${payout._id}${entry.isrc}`,
                    //         subtitle: `£ ${sumOf(entry.data, (data) => data.revenue).toFixed(2)}`,
                    //         children: entry.data.map((data) => ({
                    //             title: data.store + " " + data.territory,
                    //             subtitle: `£ ${data.revenue.toFixed(2)}`,
                    //         })),
                    //     })),
                    // })),
                ))
            )
        ),
    ),
);
