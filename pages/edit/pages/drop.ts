import { RegisterAuthRefresh, showPreviewImage } from "shared/helper.ts";
import { asRef, asRefRecord, Box, Content, createPage, createRoute, DateInput, DropDown, Grid, Label, TextButton, TextInput } from "webgen/mod.ts";
import { templateArtwork } from "../../../assets/imports.ts";
import languages from "../../../data/language.json" with { type: "json" };
import { API, ArtistRef, DropType, Song, stupidErrorAlert, zArtistTypes } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const genres = asRef(<string[]> []);

const creationState = asRefRecord({
    _id: <string | undefined> undefined,
    gtin: <string | undefined> undefined,
    title: <string | undefined> undefined,
    release: <string | undefined> undefined,
    language: <string | undefined> undefined,
    artists: <ArtistRef[]> [],
    primaryGenre: <string | undefined> undefined,
    secondaryGenre: <string | undefined> undefined,
    compositionCopyright: <string | undefined> undefined,
    soundRecordingCopyright: <string | undefined> undefined,
    artwork: <string | undefined> undefined,
    artworkData: <string | undefined> undefined,
    uploadingSongs: <Record<string, number>[]> [],
    songs: <Song[]> [],
    comments: <string | undefined> undefined,
    user: <string | undefined> undefined,
    type: <DropType | undefined> undefined,
});

const dropRoute = createRoute({
    path: "/c/music/edit?p=drop",
    events: {
        onLazyInit: async () => {
            const id = localStorage.getItem("temp-id");
            if (id === null) {
                location.href = "/c/music";
                return;
            }
            await API.getIdByDropsByMusic({ path: { id: id } }).then(stupidErrorAlert)
                .then(async (drop) => {
                    creationState.gtin.setValue(drop.gtin);
                    creationState.title.setValue(drop.title);
                    creationState.release.setValue(drop.release);
                    creationState.language.setValue(drop.language);
                    creationState.artists.setValue(drop.artists ?? [{ type: zArtistTypes.enum.PRIMARY, _id: null! }]);
                    creationState.primaryGenre.setValue(drop.primaryGenre);
                    creationState.secondaryGenre.setValue(drop.secondaryGenre);
                    creationState.compositionCopyright.setValue(drop.compositionCopyright ?? "BBN Music (via bbn.one)");
                    creationState.soundRecordingCopyright.setValue(drop.soundRecordingCopyright ?? "BBN Music (via bbn.one)");
                    creationState.artwork.setValue(drop.artwork);
                    creationState.artworkData.setValue(drop.artwork ? await API.getArtworkByDropByMusic({ path: { dropId: id } }).then((x) => URL.createObjectURL(x.data)) : templateArtwork);
                    creationState.songs.setValue(drop.songs ?? []);
                    creationState.comments.setValue(drop.comments);
                });
            genres.setValue(await API.getFirstByGenresByMusic({ path: { first: "none" } }).then(stupidErrorAlert));
        },
    },
});
export const dropPage = createPage(
    {
        label: "Drop",
        route: dropRoute,
        weight: 2,
    },
    Content(
        Grid(
            Label("Edit Drop").setTextSize("3xl").setFontWeight("bold"),
            Box(creationState.artworkData.map((artwork) => showPreviewImage({ artwork: artwork, _id: localStorage.getItem("temp-id")! }))).setRadius("large").setWidth("200px").setCssStyle("overflow", "hidden"),
            TextInput(creationState.title, "Title"),
            Grid(
                DateInput(creationState.release, "Release Date"),
                DropDown(Object.keys(languages), creationState.language, "Language").setValueRender((x) => (languages as Record<string, string>)[x]),
            ).setEvenColumns(2),
            TextButton("Artists").onClick(() => {
            }),
            Grid(
                Box(genres.map((_) => DropDown(genres, creationState.primaryGenre, "Primary Genre"))),
                Box(genres.map((_) => DropDown(genres, creationState.primaryGenre, "Primary Genre"))),
            ).setEvenColumns(2),
        ).setGap(),
    ),
);
