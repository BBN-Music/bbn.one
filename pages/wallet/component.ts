import { asRef, Box, Grid, Label, PrimaryButton, Spinner, Table, WriteSignal } from "webgen/mod.ts";
import { Wallet, zAccountType } from "../../spec/mod.ts";

export const WalletView = (wallet: Wallet) =>
    Box(
        Grid(
            Grid(
                Label(`${Number(wallet.balance?.unrestrained! + wallet.balance?.restrained!).toFixed(2)} £`)
                    .setTextSize("4xl")
                    .setFontWeight("bold"),
                Label("Balance")
                    .setFontWeight("bold")
                    .addClass("gray-color"),
            )
                .setCssStyle("background", "#181010")
                .setPadding("1rem")
                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
            Grid(
                Label(wallet.accountType == zAccountType.enum.DEFAULT ? "Basic" : zAccountType.enum.SUBSCRIBED ? "Premium" : "VIP")
                    .setTextSize("4xl")
                    .setFontWeight("bold"),
                Label("Your Subscription")
                    .setFontWeight("bold")
                    .addClass("gray-color"),
            )
                .setCssStyle("background", "#181010")
                .setPadding("1rem")
                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
            Grid(
                Label(`${wallet.cut}%`)
                    .setTextSize("4xl")
                    .setFontWeight("bold"),
                Label("Your Cut")
                    .setFontWeight("bold")
                    .addClass("gray-color"),
            )
                .setCssStyle("background", "#181010")
                .setPadding("1rem")
                .setCssStyle("borderRadius", "var(--wg-radius-mid)"),
        )
            .setTemplateColumns("50% 25% 25%")
            .setGap(),
        Table(
            asRef(wallet.transactions.map((x) => {
                const { amount, description, counterParty, timestamp } = x;
                return ({ amount, description, counterParty, timestamp });
            })),
            asRef({
                amount: {
                    titleRenderer: () => Label("Amount"),
                    cellRenderer: (amount) => Label(`${Number(amount).toFixed(2)} £`),
                    columnWidth: "auto",
                },
                description: {
                    titleRenderer: () => Label("Description"),
                    columnWidth: "auto",
                },
                timestamp: {
                    titleRenderer: () => Label("Date"),
                    cellRenderer: (timestamp) => Label(new Date(Number(timestamp)).toDateString()),
                    columnWidth: "auto",
                },
                counterParty: {
                    titleRenderer: () => Label("Counterparty"),
                    columnWidth: "auto",
                },
            }),
        ),
    );
