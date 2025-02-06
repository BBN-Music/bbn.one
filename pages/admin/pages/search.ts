import { BasicEntry } from "shared/components.ts";
import { ProfileData, RegisterAuthRefresh, sheetStack, showProfilePicture } from "shared/helper.ts";
import { placeholder } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, DateInput, DropDown, Empty, Entry, Grid, Label, SheetHeader, Spinner, TextButton, TextInput, WriteSignal } from "webgen/mod.ts";
import { API, PaymentType, SearchReturn, stupidErrorAlert, User, Wallet, zAccountType } from "../../../spec/mod.ts";
import { ReviewEntry } from "../../music/views/list.ts";
import { WalletView } from "../../wallet/component.ts";

await RegisterAuthRefresh();

const searchString = new WriteSignal<string | undefined>(undefined);
const search = asRef<SearchReturn[] | "loading" | undefined>(undefined);

searchString.listen(async (val) => {
    if (val) {
        search.setValue("loading");
        search.setValue(
            await API.getQueryBySearchByAdmin({
                path: {
                    query: val,
                },
            }).then(stupidErrorAlert),
        );
    } else {
        search.setValue(undefined);
    }
});

const userSheet = async (user: User) => {
    const drops = await API.getDropsByAdmin({ query: { user: user._id } }).then(stupidErrorAlert);
    const wallet = await API.getIdByWalletsByAdmin({ path: { id: user._id } }).then(stupidErrorAlert);
    console.log(drops);
    return Grid(
        SheetHeader("User", sheetStack),
        Grid(
            showProfilePicture(user as ProfileData).setHeight("100px").setWidth("100px"),
            Grid(
                Label(`Id: ${user._id}`),
                Label(`Username: ${user.profile.username}`),
                Label(`Email: ${user.profile.email} (${user.profile.verified ? "" : "un"}verified)`),
                Label(`Groups: ${user.groups.join(", ")}`),
            ),
            Grid(
                Label("Wallet"),
                Label(`Restrained: ${wallet.balance.restrained.toFixed(2)}`),
                Label(`Unrestrained: ${wallet.balance.unrestrained.toFixed(2)}`),
                Label(`Generated: ${wallet.transactions.filter((t) => t.amount > 0).map((t) => t.amount).reduce((a, b) => a + b, 0).toFixed(2)}`),
                TextButton("View Transactions").onClick(() => {
                    sheetStack.addSheet(Box(walletSheet(asRef(wallet))));
                }),
            ),
        ).setTemplateColumns("auto 1fr 1fr").setGap("1rem"),
        Grid(
            Label("Drops").setTextSize("2xl").setFontWeight("bold"),
            ...drops.map((drop) => ReviewEntry(drop, true)),
        ),
    ).setGap("1rem");
};

const walletSheet = (walletref: WriteSignal<Wallet>) => {
    const selectedAccountType = asRef(walletref.getValue().accountType);
    selectedAccountType.listen(async (e) => {
        await API.patchIdByWalletsByAdmin({ path: { id: walletref.getValue()._id }, body: { ...walletref.getValue(), accountType: e } }).then(stupidErrorAlert);
        walletref.setValue({ ...walletref.getValue(), accountType: e });
    });

    const selectedCut = asRef(String(walletref.getValue().cut));
    selectedCut.listen(async (c) => {
        await API.patchIdByWalletsByAdmin({ path: { id: walletref.getValue()._id }, body: { ...walletref.getValue(), cut: Number(c) } }).then(stupidErrorAlert);
        walletref.setValue({ ...walletref.getValue(), cut: Number(c) });
    });
    walletref.listen((c) => console.log("Updated in walletSheet"));
    return Grid(
        SheetHeader("Wallet", sheetStack),
        Grid(
            DropDown(Object.values(zAccountType.Values), selectedAccountType, "AccountType"),
            TextInput(selectedCut, "Cut", "change"),
            TextButton("Add Transaction").onClick(() => sheetStack.addSheet(addTransactionSheet(walletref))),
        ).setEvenColumns(3).setGap("1rem"),
        walletref.map((wallet) => WalletView(wallet)).value,
    );
};

const addTransactionSheet = (wallet: WriteSignal<Wallet>) => {
    const amount = asRef("0");
    const type = asRef<PaymentType>("UNRESTRAINED");
    const timestamp = asRef(new Date().toISOString());
    const description = asRef("PayPal Payout");
    const counterParty = asRef("PayPal");
    wallet.listen((c) => console.log("Updated in addTransactionSheet"));
    return Grid(
        DateInput(timestamp, "Date"),
        TextInput(amount, "Amount"),
        DropDown(["UNRESTRAINED", "RESTRAINED"], type, "TransactionType"),
        TextInput(description, "Description"),
        TextInput(counterParty, "Counter Party"),
        TextButton("Send").onPromiseClick(async () => {
            const walletobj = wallet.getValue();
            walletobj.transactions.push({
                amount: Number(amount.getValue()),
                type: type.getValue(),
                timestamp: String(new Date(timestamp.getValue() + "T00:00:00.000Z").getTime()),
                description: description.getValue(),
                counterParty: counterParty.getValue(),
            });
            await API.patchIdByWalletsByAdmin({ path: { id: walletobj._id }, body: walletobj });
            wallet.setValue(walletobj);
            sheetStack.removeOne();
        }),
    );
};

createPage(
    {
        route: createRoute({
            path: "/admin?list=search",
        }),
        label: "Search",
        weight: 2,
    },
    Content(
        TextInput(searchString, "Search"),
        Box(search.map((search) =>
            Grid(
                search === "loading" ? Spinner() : Empty(),
                search === undefined ? placeholder("Start Searching", "Type in the search bar to get started") : Empty(),
                ...(search !== "loading" && search !== undefined
                    ? search.map((it) => {
                        switch (it._index) {
                            case "drops":
                                return ReviewEntry(it._source);
                            case "users":
                                return Entry(BasicEntry(it._source.profile.username, `${it._source._id} - ${it._source.profile.email}`)).onPromiseClick(async () => {
                                    console.log("open user");
                                    sheetStack.addSheet(await userSheet(it._source));
                                });
                            case "songs":
                                return Entry(BasicEntry(it._source.title ?? "(no title)", `Id: ${it._source._id} User: ${it._source.user}`));
                            case "wallets":
                                return Entry(BasicEntry(it._source.user, `${it._source.balance?.restrained ?? 0} + ${it._source.balance?.unrestrained ?? 0}`));
                            default:
                                return Empty();
                        }
                    })
                    : [Empty()]),
            )
        )),
    ),
);
