import { delay } from "@std/async";
import { API, StreamingUploadHandler } from "shared/mod.ts";
import { createFilePicker } from "webgen/mod.ts";
import { DropType } from "../../spec/music.ts";
import { state } from "./state.ts";

export async function refreshState() {
    await Promise.all([
        (async () => state.drops.reviews = await API.admin.drops.list(DropType.UnderReview))(),
        (async () => state.drops.publishing = await API.admin.drops.list(DropType.Publishing))(),
        (async () => state.groups = await API.admin.groups.list())(),
        (async () => state.payouts = await API.admin.payouts.list())(),
        (async () => state.wallets = await API.admin.wallets.list())(),
        (async () => state.oauth = await API.oauth.list())(),
    ]);
}

const urls = {
    "manual": ["admin/payouts/upload", ".xlsx"],
    "oauth": ["oauth/applications/upload", "image/*"],
};
export function upload(type: keyof typeof urls): Promise<string> {
    const [url, extension] = urls[type];
    return new Promise((resolve) => {
        createFilePicker(extension).then((file) => {
            StreamingUploadHandler(url, {
                failure: (message) => alert("Your Upload has failed. Please try a different file or try again later. " + message),
                uploadDone: () => console.log("Upload done"),
                credentials: () => API.getToken(),
                backendResponse: (id) => resolve(id),
                onUploadTick: async () => await delay(2),
            }, file);
        });
    });
}
