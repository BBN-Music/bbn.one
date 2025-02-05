import { RegisterAuthRefresh } from "shared/helper.ts";
import { Navigation } from "shared/navigation.ts";
import { appendBody, Content, createPage, createRoute, FullWidthSection, Label, WebGenTheme } from "webgen/mod.ts";
import { DynaNavigation } from "../../../components/nav.ts";

await RegisterAuthRefresh();

createPage(
    {
        route: createRoute({
            path: "/admin?list=publishing",
        }),
        label: "Publishing",
        weight: 3,
    },
    Content(
        Label("test"),
    ),
);
