import axios from "axios";
import dotenv from "dotenv";

import { readFile, writeFile } from "fs/promises";

const env = dotenv.config();
const newVersion = Number(env.parsed!.VITE_APP_VERSION) + 1;
console.log(`Releasing EmiFIT with version <${newVersion}>`);

// @see https://vercel.com/docs/rest-api#endpoints/projects/edit-an-environment-variable
try {
    console.log("Reading local .env file");
    const envFile = await readFile("./.env", "utf8");
    console.log("Updating version in local .env file");
    await writeFile(
        "./.env",
        envFile.replace(/VITE_APP_VERSION=\d+(\.\d+\.\d+)?/, `VITE_APP_VERSION=${Number(newVersion)}`)
    );
    console.log("Done updating local file");

    const envListResponse = await axios.request<{ envs: VercelEnvItem[] }>({
        method: "GET",
        url: `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID || "emifit"}/env`,
        headers: { Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}` },
        data: { value: newVersion },
    });
    const VITE_APP_VERSION = envListResponse.data.envs.find((env) => env.key === "VITE_APP_VERSION")!;

    const updateResponse = await axios.request<VercelEnvItem>({
        method: "PATCH",
        url: `https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID || "emifit"}/env/${
            VITE_APP_VERSION.id
        }`,
        headers: { Authorization: `Bearer ${process.env.AUTH_BEARER_TOKEN}` },
        data: { value: String(newVersion) },
    });
    console.log(`Successfully updated VITE_APP_VERSION to ${newVersion}`);
} catch (error) {
    console.log(error.response.data);
}

interface VercelEnvItem {
    id?: string;
    type: "system" | "secret" | "encrypted" | "plain";
    key: string;
    value: string;
    configurationId?: string | null;
    createdAt?: number;
    updatedAt?: number;
    target?:
        | ("production" | "preview" | "development" | "preview" | "development")[]
        | ("production" | "preview" | "development" | "preview" | "development");
    gitBranch?: string;
    createdBy?: string | null;
    updatedBy?: string | null;
    /** Whether `value` is decrypted. */
    decrypted?: boolean;
}
