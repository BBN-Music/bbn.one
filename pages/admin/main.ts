import "./pages/reviews.ts";
import "./pages/groups.ts";
import "./pages/oauth.ts";
import "./pages/overview.ts";
import "./pages/payouts.ts";
import "./pages/search.ts";
import "./pages/wallets.ts";
import "./pages/publishing.ts";

import { RegisterAuthRefresh } from "shared/helper.ts";
import { Navigation } from "shared/navigation.ts";
import { appendBody, Content, createRoute, css, FullWidthSection, StartRouting, WebGenTheme } from "webgen/mod.ts";
import { DynaNavigation } from "../../components/nav.ts";
import { overviewPage } from "./pages/overview.ts";

await RegisterAuthRefresh();

createRoute({
    path: "/admin",
    events: {
        onActive: () => {
            overviewPage.route.navigate({}, { history: "replace" });
        }
    }
});

appendBody(
    WebGenTheme(
        Content(
            FullWidthSection(
                DynaNavigation("Admin"),
            ),
        ),
        Navigation(),
    ).addStyle(css`
        :host {
            --wg-primary: #f81919;
            --content-max-width: 1200px;
        }
    `),
);

StartRouting();