import { format, parse } from "date-fns";
import { nanoid } from "nanoid";

export const rmTrailingSlash = (path: string) => (path.endsWith("/") ? path.slice(0, path.length - 1) : path);
export const makeId = () => nanoid(10);

/** Also serves as daily.id */
export const printDate = (date: Date | number) => format(new Date(date), "MM/dd/yyyy");
export const displayDate = (date: Date | number) => format(new Date(date), "dd/MM/yyyy");

/** Also used to parse a daily.id */
export const parseDate = (date: string) => parse(date, "MM/dd/yyyy", new Date());

export const sortListFromRefArray = <T extends string | number>(arr: Array<T>, orderedProp: Array<T>) => {
    const sortedEntries = arr
        .filter((item) => orderedProp.includes(item))
        .sort((a, b) => orderedProp.indexOf(a) - orderedProp.indexOf(b))
        .concat(arr.filter((item) => !orderedProp.includes(item)));
    return sortedEntries;
};

export function slugify(text: string) {
    return text
        .toString() // Cast to string (optional)
        .normalize("NFKD") // The normalize() using NFKD method returns the Unicode Normalization Form of a given string.
        .toLowerCase() // Convert the string to lowercase letters
        .trim() // Remove whitespace from both sides of a string (optional)
        .replace(/\s+/g, "-") // Replace spaces with -
        .replace(/[^\w\-]+/g, "") // Remove all non-word chars
        .replace(/\-\-+/g, "-"); // Replace multiple - with single -
}

export const requiredRule = { value: true, message: "This field is required" };
