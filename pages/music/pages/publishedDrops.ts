import { asRef, Box, Content, createPage, createRoute, Grid, Spinner } from "webgen/mod.ts";
import { API, Drop, stupidErrorAlert, zDropType } from "../../../spec/mod.ts";
import { musicList } from "../views/list.ts";

const data = asRef<"loading" | Drop[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const publishedDrops = createPage(
    {
        label: "Published",
        weight: -10,
        route: createRoute({
            path: "/c/music?list=published",
            events: {
                onLazyInit: async () => {
                    const list = await API.getDropsByMusic().then(stupidErrorAlert);
                    data.value = list.filter((x) => x.type === zDropType.enum.PUBLISHED);
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) => musicList(items, zDropType.enum.PUBLISHED)),
        ),
    ),
);
