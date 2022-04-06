import { printDate } from "./utils";
import { fileSave, fileOpen } from "browser-fs-access";

// https://github.com/excalidraw/excalidraw/blob/cd87bd6901b47430a692a06a8928b0f732d77097/src/data/json.ts#L24-L52
export const saveAsJSON = async (serialized: string, fileHandle?: any) => {
    const blob = new Blob([serialized], { type: "application/json" });
    const name = `EmiFIT-${printDate(new Date())}.json`;
    (window as any).handle = await fileSave(
        blob,
        {
            fileName: name,
            description: "EmiFIT file",
            extensions: [".json"],
        },
        fileHandle || null
    );
};

export const loadFromJSON = async <T>() => {
    const blob = await fileOpen({
        description: "EmiFIT files",
        extensions: [".json"],
        mimeTypes: ["application/json"],
    });
    return loadFromBlob<T>(blob);
};

// https://github.com/excalidraw/excalidraw/blob/cd87bd6901b47430a692a06a8928b0f732d77097/src/data/blob.ts
const loadFromBlob = async <T>(blob: any) => {
    let contents;
    if ("text" in Blob) {
        contents = await blob.text();
    } else {
        contents = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsText(blob, "utf8");
            reader.onloadend = () => {
                if (reader.readyState === FileReader.DONE) {
                    resolve(reader.result as string);
                }
            };
        });
    }

    return JSON.parse(contents) as T;
};
