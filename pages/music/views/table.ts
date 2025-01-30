import { sheetStack } from "shared/helper.ts";
import { asRef, asRefRecord, Box, DropDown, Grid, Label, MaterialIcon, PrimaryButton, SheetHeader, Table, TextInput, WriteSignal } from "webgen/mod.ts";
import { API, Artist, ArtistRef, Song, stupidErrorAlert, zArtistTypes } from "../../../spec/mod.ts";
import "./table.css";

export function ManageSongs(songs: WriteSignal<Song[]>, uploadingSongs: WriteSignal<{ [uploadId: string]: number }[]>, primaryGenre: string, artistList?: Artist[]) {
    return Table(songs);
    // return new Table2(songs)
    //     .setColumnTemplate("auto max-content max-content max-content max-content max-content max-content min-content")
    //     .addColumn("Title", (song) =>
    //         uploadingSongs.map((x) => {
    //             if (x.filter((y) => y[song._id] !== undefined).length > 0) {
    //                 return Progress(x.find((y) => y[song._id] !== undefined)[song._id]);
    //             }
    //             const title = asRef(song.title);
    //             title.listen((newVal, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, title: newVal }));
    //             return InlineTextInput("text", "blur").addClass("low-level").ref(title);
    //         }).asRefComponent())
    //     .addColumn("Artists", (song) =>
    //         Box(...song.artists.map((artist) => "name" in artist ? ProfilePicture(Label(""), artist.name) : ProfilePicture(Label(""), artist._id)), IconButton(MIcon("add"), "add"))
    //             .addClass("artists-list")
    //             .onClick(() => {
    //                 const artists = asRef(song.artists);
    //                 artists.listen((newVal, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, artists: newVal }));
    //                 EditArtistsDialog(artists, artistList).open();
    //             }))
    //     .addColumn("Year", (song) => {
    //         const data = asRef(song.year.toString());
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, year: parseInt(x) }));
    //         return DropDownInput("Year", getYearList())
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Language", (song) => {
    //         const data = asRef(song.language);
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, language: x }));
    //         return DropDownInput("Language", Object.keys(language))
    //             .setRender((key) => language[<keyof typeof language> key])
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Secondary Genre", (song) => {
    //         const data = asRef(song.secondaryGenre);
    //         data.listen((x, oldVal) => (oldVal != undefined) && songs.updateItem(song, { ...song, secondaryGenre: x }));
    //         return DropDownInput("Secondary Genre", getSecondary(genres, primaryGenre) ?? [])
    //             .ref(data)
    //             .addClass("low-level");
    //     })
    //     .addColumn("Instrumental", (song) =>
    //         Checkbox(song.instrumental ?? false)
    //             .setColor(song.explicit ? Color.Disabled : Color.Grayscaled)
    //             .onClick((_, value) => songs.updateItem(song, { ...song, instrumental: value }))
    //             .addClass("low-level"))
    //     .addColumn("Explicit", (song) =>
    //         Checkbox(song.explicit ?? false)
    //             .setColor(song.instrumental ? Color.Disabled : Color.Grayscaled)
    //             .onClick((_, value) => songs.updateItem(song, { ...song, explicit: value }))
    //             .addClass("low-level"))
    //     .addColumn("", (song) => IconButton(MIcon("delete"), "Delete").onClick(() => songs.setValue(songs.getValue().filter((x) => x._id != song._id))))
    //     .addClass("inverted-class");
}

export const createArtistSheet = (name?: string) => {
    const state = asRefRecord({
        name,
        spotify: <string | undefined> undefined,
        apple: <string | undefined> undefined,
    });
    return Grid(
        SheetHeader("Create Artist", sheetStack),
        TextInput(state.name, "Artist Name"),
        TextInput(state.spotify, "Spotify URL"),
        TextInput(state.apple, "Apple Music URL"),
        PrimaryButton("Create")
            .onPromiseClick(async () => {
                await API.postArtistsByMusic({
                    body: {
                        name: state.name.value!,
                        spotify: state.spotify.value,
                        apple: state.apple.value,
                    },
                });
                sheetStack.removeOne();
                location.reload();
            })
            .setDisabled(state.name.map((x) => !x))
            .setJustifySelf("start"),
    )
        .setGap()
        .setWidth("25rem");
};

export const EditArtistsDialog = (artists: WriteSignal<ArtistRef[]>, provided?: Artist[]) => {
    const artistList = provided ? asRef(provided) : asRef<Artist[]>([]);

    if (!provided) {
        API.getArtistsByMusic().then(stupidErrorAlert).then((x) => artistList.setValue(x));
    }

    return Grid(
        SheetHeader("Edit Artists", sheetStack),
        Box(artistList.map((list) =>
            Box(
                Grid(
                    Label("Type").setFontWeight("bold"),
                    Label("Name").setFontWeight("bold"),
                    Label("Action").setFontWeight("bold"),
                ).setTemplateColumns("30% 60% 10%"),
                Box(artists.map((x) =>
                    x.map((artist) => {
                        const type = asRef(artist.type);
                        type.listen((val, oldVal) => {
                            if (oldVal !== undefined) {
                                x[x.indexOf(artist)] = val == zArtistTypes.enum.PRIMARY || val == zArtistTypes.enum.FEATURING ? { type: val, _id: null! } : { type: val, name: "" };
                                console.log(x);
                                artists.setValue(x);
                            }
                        });
                        return Grid(
                            DropDown(Object.values(zArtistTypes.enum), type),
                            artist.type == zArtistTypes.enum.PRIMARY || artist.type == zArtistTypes.enum.FEATURING ? DropDown(list.map((x) => x._id), asRef("artist._id")) : TextInput(asRef("artist.name"), "Name"),
                            PrimaryButton("").addPrefix(MaterialIcon("delete")).onClick(() => {
                                x.splice(x.indexOf(artist), 1);
                                artists.setValue(x);
                            }),
                        ).setGap().setTemplateColumns("30% 60% 10%");
                    })
                )),
            )
        )),
        PrimaryButton("Add Artist")
            .setJustifySelf("end")
            .onClick(() => artists.setValue([...artists.value, { type: zArtistTypes.enum.PRIMARY, _id: null! }])),
        PrimaryButton("Save")
            .onClick(() => sheetStack.removeOne()),
    ).setGap();
};
