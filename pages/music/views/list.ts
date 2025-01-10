import { showPreviewImage } from "shared/helper.ts";
import { placeholder } from "shared/list.ts";
import { asRef, Empty, Entry, Grid, Image, Label } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { type Artist, Drop, DropType } from "../../../spec/music.ts";

export function DropEntry(x: Drop) {
    return Entry(
        Grid(
            Grid(
                Label(x.title ?? "(no drop name)").setFontWeight("bold").setTextSize("3xl"),
                Label(`${x.release ?? "(no release date)"} - ${x.gtin ?? "(no GTIN)"}`),
            )
                .setHeight("max-content")
                .setAlignSelf("center"),
        )
            .setGap()
            .setTemplateColumns("max-content auto min-content")
            .setPadding("1rem 0")
            .addPrefix(showPreviewImage(x).setWidth("100px"))
            .addSuffix((() => {
                if (x.type == DropType.UnderReview) {
                    return Label("Under Review")
                        .setCssStyle("backgroundColor", "#BCBCBC")
                        .setCssStyle("borderRadius", "10rem")
                        .setHeight("max-content")
                        .setAlignSelf("center");
                }

                if (x.type == DropType.ReviewDeclined) {
                    return Label("Declined")
                        .setCssStyle("backgroundColor", "#BCBCBC")
                        .setCssStyle("borderRadius", "10rem")
                        .setHeight("max-content")
                        .setAlignSelf("center");
                }

                return Empty();
            })()),
    )
        .onClick(() => location.href = x.type === DropType.Unsubmitted ? `/c/music/new-drop?id=${x._id}` : `/c/music/edit?id=${x._id}`);
}

export function ArtistEntry(x: Artist) {
    return Entry({
        title: x.name,
        // TODO: Add used on x songs, x drops, maybe even streams?
    })
        //TODO: links
        // .addSuffix(
        //     Horizontal(
        //         LinkButton("Spotify", "fdgdf"),
        //         LinkButton("Apple Music", "fdgdf"),
        //     ).setGap(),
        // )
        .addPrefix(Image(templateArtwork, "Artist Profile Picture"));
}

export const musicList = (list: Drop[], type: DropType) =>
    Grid(
        CategoryRender(
            list.filter((_, i) => i == 0),
            "Latest Drop",
        ),
        CategoryRender(
            list.filter((_, i) => i > 0),
            "History",
        ),
        list.length == 0 ? placeholder("No Drops", `You don’t have any ${EnumToDisplay(type)} Drops`) : Empty(),
    )
        .setGap("20px");

export function CategoryRender(dropList: Drop[], title: string) {
    if (dropList.length == 0) {
        return Empty();
    }
    return Grid(
        Label(title).setFontWeight("bold").setTextSize("4xl"),
        Grid(asRef(dropList.map((x) => DropEntry(x)))).setGap(),
    ).setGap();
}

export function EnumToDisplay(state: DropType) {
    return state === "PUBLISHED" ? "published" : "";
}

export function DropTypeToText(type: DropType) {
    return (<Record<DropType, string>> {
        "PRIVATE": "Private",
        "PUBLISHED": "Published",
        "UNDER_REVIEW": "Under Review",
        "UNSUBMITTED": "Draft",
        "REVIEW_DECLINED": "Rejected",
    })[type];
}
