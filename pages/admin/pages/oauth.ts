import { RegisterAuthRefresh } from "shared/helper.ts";
import { asRef, Content, createPage, createRoute, Entry, Label, TextButton } from "webgen/mod.ts";
import { API, OAuthApp, stupidErrorAlert } from "../../../spec/mod.ts";
import { BasicEntry } from "shared/components.ts";

await RegisterAuthRefresh();

const applications = asRef<OAuthApp[] | "loading">("loading");
createPage(
    {
        route: createRoute({
            path: "/admin?list=oauth",
            events: {
                onLazyInit: async () => {
                    applications.setValue(await API.getApplicationsByOauth().then(stupidErrorAlert));
                },
            },
        }),
        label: "OAuth",
        weight: 6,
    },
    Content(
        applications.map((applications) => applications === "loading" ? Label("Loading...") : applications.map((app) => Entry(BasicEntry(app.name, app._id)))),
    ),
);
