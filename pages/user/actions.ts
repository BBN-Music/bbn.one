import { assert } from "@std/assert";
import { delay } from "@std/async";
import { forceRefreshToken, gotoGoal } from "shared/helper.ts";
import { API, displayError, stupidErrorAlert } from "../../spec/mod.ts";
import { state } from "./state.ts";

export async function loginUser() {
    try {
        assert(state.email && state.password, "Missing Email or Password");
        const rsp = await API.postEmailByAuth({
            body: {
                email: state.email.value,
                password: state.password.value,
            },
        });
        if (rsp.error) {
            throw rsp.error;
        }

        await logIn(rsp.data as { token: string });
        gotoGoal();
    } catch (error) {
        state.error.setValue(displayError(error));
    }
}

export async function registerUser() {
    try {
        const { name, email, password } = {
            email: state.email.value ?? "",
            password: state.password.value ?? "",
            name: state.name.value ?? "",
        };
        assert(name && email && password, "Missing fields");
        const rsp = await API.postRegisterByAuth({ body: { name, email, password } });
        if (rsp.error) {
            throw rsp.error;
        }

        await logIn(rsp.data as { token: string });
        gotoGoal();
    } catch (error) {
        state.error.setValue(displayError(error));
    }
}

export async function logIn(data: { token: string }) {
    const access = await API.postRefreshAccessTokenByAuth({
        headers: {
            "Authorization": `Bearer ${data.token}`,
        },
    }).then(stupidErrorAlert) as { token: string };
    localStorage["access-token"] = access.token;
    localStorage["refresh-token"] = data.token;
}

export async function handleStateChange() {
    const para = new URLSearchParams(location.search);
    const params = {
        token: para.get("token"),
        type: para.get("type"),
        code: para.get("code"),
    };

    if (params.type && ["google", "discord", "microsoft"].includes(params.type) && params.code) {
        const rsp = await API.postProviderByOauthByAuth({ body: { type: params.type, code: params.code }, path: { provider: params.type } });
        if (rsp.error) {
            return state.error.setValue(displayError(rsp.error));
        }
        await logIn(rsp.data as { token: string });
        gotoGoal();
        return;
    }
    if (params.type == "reset-password" && params.token) {
        const rsp = await API.getTokenByFromUserInteractionByAuth({ body: { token: params.token }, path: { token: params.token } });
        if (rsp.error) {
            return state.error.setValue(displayError(rsp.error));
        }
        await logIn(rsp.data as { token: string });
        gotoGoal();
        return;
    }
    if (params.type == "verify-email" && params.token) {
        const rsp = await API.postTokenByValidateByMailByUser({ path: { token: params.token } });
        if (rsp.error) {
            return state.error.setValue(displayError(rsp.error));
        }
        await forceRefreshToken();
        await delay(1000);
        gotoGoal();
        return;
    }
    state.type.setValue("login");
}
