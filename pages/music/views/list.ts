import { showPreviewImage } from "shared/helper.ts";
import { placeholder } from "shared/list.ts";
import { BasicEntry } from "shared/mod.ts";
import { asRef, Box, Empty, Entry, Grid, Image, Label } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import { type Artist, Drop, DropType, zDropType } from "../../../spec/mod.ts";

export function ReviewEntry(x: Partial<Drop>, small: boolean = false) {
    return Entry(
        BasicEntry(
            Box(
                Label(x.title ?? "(no drop name)").setFontWeight("bold").setTextSize(small ? "xl" : "3xl"),
                Label(x.release ?? "(no release date)").setTextSize(small ? "lg" : "2xl").setPadding("0 0 0 0.5rem"),
            ),
            `user: ${x.user} - gtin: ${x.gtin ?? "(no GTIN)"} - id: ${x._id}`,
        )
            .onClick(() => location.href = `/admin/review?id=${x._id}`)
            .addPrefix(showPreviewImage(x).setWidth(small ? "50px" : "100px")),
    );
}

export function DropEntry(x: Partial<Drop>) {
    return Entry(
        BasicEntry(x.title ?? "(no drop name)", x.release ?? "(no release date)")
            .addPrefix(showPreviewImage(x).setWidth("100px"))
            .addSuffix((() => {
                if (x.type == zDropType.enum.UNDER_REVIEW) {
                    return Label("Under Review")
                        .setCssStyle("backgroundColor", "#BCBCBC")
                        .setCssStyle("borderRadius", "10rem")
                        .setHeight("max-content")
                        .setAlignSelf("center");
                }

                if (x.type == zDropType.enum.REVIEW_DECLINED) {
                    return Label("Declined")
                        .setCssStyle("backgroundColor", "#BCBCBC")
                        .setCssStyle("borderRadius", "10rem")
                        .setHeight("max-content")
                        .setAlignSelf("center");
                }

                return Empty();
            })()),
    ).onClick(() => location.href = x.type === zDropType.enum.UNSUBMITTED ? `/c/music/new-drop?id=${x._id}` : `/c/music/edit?id=${x._id}`);
}

export function ArtistEntry(x: Artist) {
    return Entry(BasicEntry(x.name).addPrefix(Image(templateArtwork, "Artist Profile Picture").setWidth("100px")));
    // TODO: Add used on x songs, x drops, maybe even streams?
    // Label("Used on ")
    //TODO: links
    // .addSuffix(
    //     Horizontal(
    //         LinkButton("Spotify", "fdgdf"),
    //         LinkButton("Apple Music", "fdgdf"),
    //     ).setGap(),
    // )
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
