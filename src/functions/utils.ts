import { format, parse } from "date-fns";
import { nanoid } from "nanoid";

export const rmTrailingSlash = (path: string) => (path.endsWith("/") ? path.slice(0, path.length - 1) : path);
export const makeId = () => nanoid(10);

export const printDate = (date: Date | number) => format(new Date(date), "MM/dd/yyyy");
export const parseDate = (date: string) => parse(date, "MM/dd/yyyy", new Date());
