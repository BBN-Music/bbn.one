import { asRef, Box, Content, createPage, createRoute, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { API, Payout, PayoutResponse, stupidErrorAlert } from "../../../spec/mod.ts";

const data = asRef<"loading" | PayoutResponse[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const payoutsPage = createPage(
    {
        label: "Payouts",
        weight: 10,
        route: createRoute({
            path: "/c/music?list=payouts",
            events: {
                onLazyInit: async () => {
                    const list = await API.getPayoutsByPayment().then(stupidErrorAlert);
                    data.value = list;
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) =>
                items.map((item) =>
                    Entry(
                        Grid(
                            Label(item.period).setTextSize("3xl").setFontWeight("bold"),
                            Label(item.moneythisperiod + " Earnings"),
                            Label(item.streams + " Streams"),
                        ).setPadding("1rem 0"),
                    )
                )
            ),
        ),
    ),
);
