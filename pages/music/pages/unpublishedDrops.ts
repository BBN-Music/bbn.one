import { asRef, Box, Content, createPage, createRoute, Grid, Spinner } from "webgen/mod.ts";
import { API, Drop, stupidErrorAlert, zDropType } from "../../../spec/mod.ts";
import { musicList } from "../views/list.ts";

const data = asRef<"loading" | Drop[]>("loading");

const source = data.map((data) => data === "loading" ? [] : data);

export const unpublishedDropsPage = createPage(
    {
        label: "Unpublished",
        weight: -8,
        route: createRoute({
            path: "/c/music?list=unpublished",
            events: {
                onLazyInit: async () => {
                    const list = await API.getDropsByMusic().then(stupidErrorAlert);
                    data.value = list.filter((x) =>
                        x.type === zDropType.enum.UNDER_REVIEW ||
                        x.type === zDropType.enum.PRIVATE ||
                        x.type === zDropType.enum.REVIEW_DECLINED
                    );
                },
            },
        }),
    },
    Content(
        Box(data.map((data) => data === "loading" ? Spinner() : [])),
        Grid(
            source.map((items) => musicList(items, zDropType.enum.PRIVATE)),
        ),
    ),
);
