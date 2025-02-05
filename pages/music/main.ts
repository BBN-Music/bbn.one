import "./pages/artists.ts";
import "./pages/draftDrops.ts";
import "./pages/payouts.ts";
import "./pages/publishedDrops.ts";
import "./pages/unpublishedDrops.ts";

import { RegisterAuthRefresh, sheetStack } from "shared/helper.ts";
import { Navigation } from "shared/navigation.ts";
import { activeRoute, appendBody, Box, Content, createRoute, css, DialogContainer, FullWidthSection, PrimaryButton, StartRouting, WebGenTheme } from "webgen/mod.ts";
import "../../assets/css/main.css";
import "../../assets/css/music.css";
import { DynaNavigation } from "../../components/nav.ts";
import { API, stupidErrorAlert, zDropType } from "../../spec/mod.ts";
import { artistsPage } from "./pages/artists.ts";
import { draftsDropsPage } from "./pages/draftDrops.ts";
import { publishedDrops } from "./pages/publishedDrops.ts";
import { createArtistSheet } from "./views/table.ts";

await RegisterAuthRefresh();

createRoute({
    path: "/c/music",
    events: {
        onActive: async () => {
            const list = await API.getDropsByMusic().then(stupidErrorAlert);
            const published = list.filter((x) => x.type === zDropType.enum.PUBLISHED);

            if (published.length >= 1) {
                publishedDrops.route.navigate({}, { history: "replace" });
            } else {
                draftsDropsPage.route.navigate({}, { history: "replace" });
            }
        },
    },
});

appendBody(
    WebGenTheme(
        DialogContainer(sheetStack.visible(), sheetStack),
        Content(
            FullWidthSection(
                DynaNavigation("Music"),
            ),
        ),
        Navigation(
            Box(
                activeRoute.map((route) => route === artistsPage.route.entry)
                    .map((isArtistsRoute) =>
                        isArtistsRoute
                            ? PrimaryButton("Create new Artist")
                                .onClick(async () => {
                                    await createArtistSheet();
                                    location.reload();
                                })
                            : PrimaryButton("Create new Drop")
                                .onPromiseClick(async () => {
                                    const { id } = await API.postMusic().then(stupidErrorAlert) as { id: string };
                                    location.href = `/c/music/new-drop?id=${id}`;
                                })
                    ),
            ),
        ),
    )
        .addStyle(css`
            :host {
                --wg-primary: rgb(255, 171, 82);
                --content-max-width: 1200px;
            }
        `),
);

StartRouting();
