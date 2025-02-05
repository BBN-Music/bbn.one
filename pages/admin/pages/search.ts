import { BasicEntry } from "shared/components.ts";
import { RegisterAuthRefresh } from "shared/helper.ts";
import { placeholder } from "shared/mod.ts";
import { asRef, Box, Content, createPage, createRoute, Empty, Entry, Grid, Spinner, TextInput, WriteSignal } from "webgen/mod.ts";
import { API, SearchReturn, stupidErrorAlert } from "../../../spec/mod.ts";

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
                            case "transcripts":
                                return Entry(BasicEntry(it._source.with, it._index));
                            default:
                                return Empty();
                                // case "drops":
                                //     return ReviewEntry(it._source);
                                // case "servers":
                                //     return Entry(
                                //         {
                                //             title: it._source._id,
                                //             subtitle: it._index,
                                //         },
                                //     );
                                // case "users":
                                //     return Entry({
                                //         title: it._source.profile.username,
                                //         subtitle: `${it._source._id} - ${it._source.profile.email}`,
                                //     })
                                //         .addClass("small")
                                //         .onPromiseClick(async () => {
                                //             const monaco = await lazyMonaco();
                                //             const box = document.createElement("div");
                                //             monaco.editor.create(box, {
                                //                 value: JSON.stringify(it._source, null, 2),
                                //                 language: "json",
                                //                 theme: "vs-dark",
                                //                 automaticLayout: true,
                                //             });

                                //             SheetDialog(sheetStack, "User", Custom(box).setHeight("800px").setWidth("1200px")).open();
                                //         })
                                //         .addPrefix(showProfilePicture(it._source));
                                // case "files":
                                //     return entryFile(it._source);
                                // case "user-events":
                                //     return Entry({
                                //         title: it._source.type,
                                //         subtitle: `${it._source.userId} - ${it._source.ip}`,
                                //     });
                                // case "empty":
                                //     return placeholder("Start Searching", "Type in the search bar to get started");
                                // case "none":
                                //     return placeholder("No Results", "Try a different search term");
                        }
                    })
                    : [Empty()]),
            )
        )),
    ),
);
