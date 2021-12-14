import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/folders";
const relativeDestinationUrl:string = "/sites/DEXA2022/";

export async function getUser(email: string) {
    let user = await sp.site.rootWeb.ensureUser(email);
    return user;
}