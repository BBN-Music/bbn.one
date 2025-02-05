import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Entry, Label, Spinner } from "webgen/mod.ts";
import { AdminDrop, API, stupidErrorAlert } from "../../../spec/mod.ts";
import { BasicEntry } from "shared/components.ts";
import { DropEntry, musicList } from "../../music/views/list.ts";

await RegisterAuthRefresh();

const reviews = asRef<AdminDrop[] | "loading">("loading");

createPage(
    {
        route: createRoute({
            path: "/admin?list=reviews",
            events: {
                onLazyInit: async () => {
                    reviews.setValue(await API.getDropsByAdmin({ query: { type: "UNDER_REVIEW" } }).then(stupidErrorAlert));
                },
            },
        }),
        label: "Reviews",
        weight: 3,
    },
    Content(
        reviews.map((reviews) => 
            reviews === "loading" ? Spinner() : reviews.map(review =>
                DropEntry(review)
            )
         )
    ),
);