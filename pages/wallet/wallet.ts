import { RegisterAuthRefresh, renewAccessTokenIfNeeded, sheetStack } from "shared/helper.ts";
import { appendBody, asRef, Box, Color, Content, DialogContainer, FullWidthSection, Grid, Label, PrimaryButton, Spinner, Table, WebGenTheme, WriteSignal } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { API, stupidErrorAlert, Wallet, zAccountType } from "../../spec/mod.ts";
import { WalletView } from "./component.ts";

await RegisterAuthRefresh();

const wallet = asRef<Wallet | undefined>(undefined);

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Wallet"),
            ),
            Box(wallet.map((wallet) =>
                wallet
                    ? Grid(
                        Grid(
                            Label("Your Wallet").setFontWeight("bold").setTextSize("3xl"),
                            PrimaryButton("Request Payout").onClick(() => {
                                alert("Please email support@bbn.one and include your PayPal Address");
                            }),
                        ).setGap().setTemplateColumns("1fr auto"),
                        WalletView(wallet)
                    )
                    .setGap()
                    .setMargin("5rem 0 2rem")
                    : Spinner()
            ))
        ),
    ).setPrimaryColor(new Color("#eb8c2d")),
);

renewAccessTokenIfNeeded()
    .then(async () => wallet.setValue(await API.getWallet().then(stupidErrorAlert)));
