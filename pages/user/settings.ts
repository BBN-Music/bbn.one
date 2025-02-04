import { activeUser, ErrorMessage, IsLoggedIn, logOut, RegisterAuthRefresh, sheetStack, showProfilePicture } from "shared/helper.ts";
import { appendBody, asRefRecord, Color, Content, DialogContainer, EmailInput, FullWidthSection, Grid, PasswordInput, PrimaryButton, TextInput, WebGenTheme } from "webgen/mod.ts";
import { z } from "zod/mod.ts";
import "../../assets/css/main.css";
import { DynaNavigation } from "../../components/nav.ts";
import { API, stupidErrorAlert } from "../../spec/mod.ts";

await RegisterAuthRefresh();

const state = asRefRecord({
    email: activeUser.email.value ?? "",
    name: activeUser.username.value,
    password: undefined,
    verifyPassword: undefined,
    validationState: <string | undefined> undefined,
});

appendBody(WebGenTheme(
    DialogContainer(sheetStack.visible(), sheetStack),
    Content(
        FullWidthSection(
            DynaNavigation("Settings"),
        ),
        Grid(
            showProfilePicture(IsLoggedIn()!).setWidth("300px").setJustifySelf("center"),
            Grid(
                TextInput(state.name, "Name"),
                EmailInput(state.email, "Email"),
                PasswordInput(state.password, "New Password"),
                PasswordInput(state.verifyPassword, "Verify New Password"),
            ).setDynamicColumns(20).setGap(),
            PrimaryButton("Save").onPromiseClick(async () => {
                const validator = z.object({
                    name: z.string().min(2),
                    email: z.string().email(),
                    password: z.string().min(8).refine((val) => state.verifyPassword ? val == state.verifyPassword.value : true, { message: "Your new password didn't match" }).optional(),
                    verifyPassword: z.string().min(8).optional(),
                }).safeParse(Object.fromEntries(Object.entries(state).map(([key, state]) => [key, state.value])));

                if (validator.success) {
                    state.validationState.setValue(undefined);
                    await API.putUserByUser({ body: validator.data }).then(stupidErrorAlert);
                } else {
                    state.validationState.setValue(getErrorMessage(validator));
                }
            }),
            PrimaryButton("Logout").setCustomColor(new Color("red")).onClick(() => logOut()),
            ErrorMessage(state.validationState),
        ).setGap(),
    ),
));

export function getErrorMessage(state: z.SafeParseReturnType<any, any>): string {
    if (!(state && state.success !== true)) return "";
    const selc = state.error.errors.find((x) => x.code == "custom" && x.message != "Invalid input") ?? state.error.errors.find((x) => x.message != "Required") ?? state.error.errors[0];

    const path = selc.path.map((x) => typeof x == "number" ? `[${x}]` : x.replace(/^./, (str) => str.toUpperCase())).join("");

    return `${path}: ${selc.message}`;
}

// const publicKey = {
//                     challenge: new Uint8Array([ 117, 61, 252, 231, 191, 241 ]),
//                     rp: { id: "localhost", name: "BBN Music" },
//                     user: {
//                         id: new TextEncoder().encode(activeUser.id ?? ""),
//                         name: activeUser.email ?? "",
//                         displayName: activeUser.username ?? ""
//                     },
//                     excludeCredentials: [
//                         { id: new Uint8Array([ 79, 252, 83, 72, 214, 7, 89, 26 ]), type: "public-key" as PublicKeyCredentialType, transports: [ "usb", "nfc", "ble" ] as AuthenticatorTransport[] }
//                     ],
//                     pubKeyCredParams: [ { type: "public-key" as PublicKeyCredentialType, alg: -7 }, { type: "public-key" as PublicKeyCredentialType, alg: -257 } ]
//                 };

//                 const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;

//                 console.log(credential);

//                 const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

//                 // Use a lookup table to find the index.
//                 const lookup = new Uint8Array(256);
//                 for (let i = 0; i < chars.length; i++) {
//                     lookup[ chars.charCodeAt(i) ] = i;
//                 }

//                 const encode = (arraybuffer: ArrayBuffer): string => {
//                     const bytes = new Uint8Array(arraybuffer);
//                     const len = bytes.length;
//                     let base64 = '';

//                     for (let i = 0; i < len; i += 3) {
//                         base64 += chars[ bytes[ i ] >> 2 ];
//                         base64 += chars[ ((bytes[ i ] & 3) << 4) | (bytes[ i + 1 ] >> 4) ];
//                         base64 += chars[ ((bytes[ i + 1 ] & 15) << 2) | (bytes[ i + 2 ] >> 6) ];
//                         base64 += chars[ bytes[ i + 2 ] & 63 ];
//                     }

//                     if (len % 3 === 2) {
//                         base64 = base64.substring(0, base64.length - 1);
//                     } else if (len % 3 === 1) {
//                         base64 = base64.substring(0, base64.length - 2);
//                     }

//                     return base64;
//                 };

//                 console.log(encode(credential.response.clientDataJSON));
//                 console.log(encode((credential.response as AuthenticatorAttestationResponse).attestationObject));
//                 console.log(credential.getClientExtensionResults())
