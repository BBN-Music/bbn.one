import { RegisterAuthRefresh } from "shared/helper.ts";
import { BasicEntry } from "shared/mod.ts";
import { asRef, Content, createPage, createRoute, Entry, Label } from "webgen/mod.ts";
import { API, Group, stupidErrorAlert } from "../../../spec/mod.ts";

await RegisterAuthRefresh();

const groups = asRef<Group[] | "loading">("loading");

createPage(
    {
        route: createRoute({
            path: "/admin?list=groups",
            events: {
                onLazyInit: async () => {
                    groups.setValue(await API.getGroupsByAdmin().then(stupidErrorAlert));
                },
            },
        }),
        label: "Groups",
        weight: 4,
    },
    Content(
        groups.map((groups) => groups === "loading" ? Label("Loading...") : groups.map((group) => Entry(BasicEntry(group.displayName, "Permissions: "+group.permission.join(", "))))),
    ),
);
