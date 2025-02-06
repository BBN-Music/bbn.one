import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Spinner } from "webgen/mod.ts";
import { AdminDrop, API, stupidErrorAlert, zDropType } from "../../../spec/mod.ts";
import { ReviewEntry } from "../../music/views/list.ts";
import { reviews } from "./reviews.ts";

await RegisterAuthRefresh();

export const publishing = asRef<AdminDrop[] | "loading">("loading");

createPage(
    {
        route: createRoute({
            path: "/admin?list=publishing",
            events: {
                onLazyInit: async () => {
                    reviews.setValue(await API.getDropsByAdmin({ query: { type: zDropType.enum.PUBLISHING } }).then(stupidErrorAlert));
                },
            },
        }),
        label: "Publishing",
        weight: 3,
    },
    Content(
        reviews.map((reviews) => reviews === "loading" ? Spinner() : reviews.map((review) => ReviewEntry(review))),
    ),
);
