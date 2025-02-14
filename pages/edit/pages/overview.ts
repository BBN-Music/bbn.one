import { BasicEntry } from "shared/components.ts";
import { permCheck, RegisterAuthRefresh, showPreviewImage } from "shared/helper.ts";
import { asRef, Box, Content, createPage, createRoute, Empty, Entry, Grid, Label, Spinner } from "webgen/mod.ts";
import { API, DropType, FullDrop, stupidErrorAlert } from "../../../spec/mod.ts";
import { DropTypeToText } from "../../music/views/list.ts";
import { dropPage } from "./drop.ts";

await RegisterAuthRefresh();

const Permissions = {
    canTakedown: (type: DropType) => type == "PUBLISHED",
    canSubmit: (type: DropType) => (<DropType[]> ["UNSUBMITTED", "PRIVATE"]).includes(type),
    canEdit: (type: DropType) => (type == "PRIVATE" || type == "UNSUBMITTED") || permCheck("/bbn/manage/drops"),
    canCancelReview: (type: DropType) => type == "UNDER_REVIEW",
};

const drop = asRef(<Partial<FullDrop> | undefined> undefined);

const overviewRoute = createRoute({
    path: "/c/music/edit?p=overview",
    events: {
        onLazyInit: async () => {
            const id = localStorage.getItem("temp-id");
            if (id === null) {
                location.href = "/c/music";
                return;
            }
            drop.setValue(await API.getIdByDropsByMusic({ path: { id: id } }).then(stupidErrorAlert));
        },
    },
});

export const overviewPage = createPage(
    {
        label: "Overview",
        route: overviewRoute,
        weight: 1
    },
    Content(
        Grid(
            drop.map((drop) => showPreviewImage(drop).setWidth("200px").setRadius("large")),
            Grid(
                drop.map((drop) => drop ? Label(drop.title ?? "(no title)").setTextSize("3xl").setFontWeight("bold") : Spinner()),
                Box(drop.map((drop) => drop ? Label(drop.release ?? "(no release date)").setTextSize("2xl") : Spinner())),
                Box(drop.map((drop) => drop ? Label(drop.type ? DropTypeToText(drop.type) : "").setTextSize("2xl") : Spinner())),
            ).setAlignContent("center"),
        ).setTemplateColumns("auto 1fr").setGap("1rem").setMargin("2rem 0 1rem 0"),
        Entry(BasicEntry("Drop", "Change Title, Release Date, ...")).onClick(() => {
            dropPage.route.navigate({});
        }),
        Entry(BasicEntry("Songs", "Move Songs, Remove Songs, Add Songs, ...")),
        Entry(BasicEntry("Export", "Download your complete Drop with every Song")),
        Box(drop.map((drop) =>
            drop && drop.type
                ? [
                    Permissions.canCancelReview(drop.type) ? Entry(BasicEntry("Cancel Review", "Need to change Something? Cancel it now")) : Empty(),
                    Permissions.canSubmit(drop.type) ? Entry(BasicEntry("Publish", "Submit your Drop for Approval")) : Empty(),
                    Permissions.canTakedown(drop.type) ? Entry(BasicEntry("Takedown", "Completely Takedown your Drop")) : Empty(),
                    drop.type === "PUBLISHED" ? Entry(BasicEntry("Open", "Navigate to your Drop on Streaming Services")) : Empty(),
                    drop.type === "PUBLISHED" ? Entry(BasicEntry("Sharing Link", "Show your music to all your listeners")) : Empty(),
                ]
                : Empty()
        )),
    ),
);
