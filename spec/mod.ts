export * as API from "./gen/sdk.gen.ts";
export * from "./gen/types.gen.ts";
export * from "./gen/zod.gen.ts";

import { client } from "./gen/client.gen.ts";

export const Permissions = [
    "/hmsys",
    "/hmsys/user",
    "/hmsys/user/manage",

    "/bbn",
    "/bbn/manage",
    "/bbn/manage/drops",
    "/bbn/manage/drops/review",
    "/bbn/manage/payouts",
] as const;

export type Permission = typeof Permissions[number];

export const APITools = {
    oauthRedirect: (type: "discord" | "google" | "microsoft") => `${APITools.baseUrl()}auth/redirect/${type}?goal=${localStorage.getItem("goal") ?? "/c/music"}`,
    token: () => localStorage.getItem("access-token"),
    baseUrl: () => localStorage.getItem("OVERRIDE_BASE_URL") || (location.hostname === "localhost" ? "http://localhost:8443/" : "https://bbn.one/"),
    isPermitted: (requiredPermissions: Permission[], userPermission: Permission[]) => requiredPermissions.every((required) => userPermission.find((user) => required.startsWith(user))),
};

client.setConfig({
    auth: () => APITools.token() ?? "",
    baseUrl: APITools.baseUrl(),
});

export function stupidErrorAlert<T>(input: { data?: T; error?: unknown }) {
    if (input.error) {
        alert(displayError(input.error));
        throw input.error;
    }
    return input.data!;
}

export const defaultError = "Something happend unexpectedly. Please try again later.";

// This is very limited make error handling more useful.
export function displayError(data: unknown) {
    console.error("displayError", data);
    console.trace();
    if (data instanceof Error) {
        if (data.message === "Failed to fetch") {
            return "Error: Can't load. Please try again later.";
        }
        if (data.message) {
            return `Error: ${data.message}`;
        }
    }
    if (typeof data === "string") {
        try {
            const jdata = JSON.parse(data) as unknown;
            // display assert errors that have a message
            if (jdata && typeof jdata === "object" && "type" in jdata && "message" in jdata && (jdata.type === "assert" || jdata.type === "zod") && jdata.message) return `Error: ${jdata.message}`;
        } catch (_e) {
            //
        }
    }
    return `Error: ${defaultError}`;
}
