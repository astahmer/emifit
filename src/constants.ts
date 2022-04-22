import { uniques, uniquesByProp } from "@pastable/core";
import { groupIn } from "./functions/groupBy";
import { Tag } from "./orm-types";
import { LiteralUnion } from "./types";

const SharedTags = [
    { id: "Machine", label: "Machine", group: "Type" },
    { id: "Freeweight", label: "Freeweight", group: "Type" },
    { id: "Bodyweight", label: "Bodyweight", group: "Type" },
] as const;

export const Categories = [
    {
        id: "PushDay",
        label: "Push day",
        children: [
            ...SharedTags,
            { id: "Chest", label: "Chest", group: "Muscle" },
            { id: "Triceps", label: "Triceps", group: "Muscle" },
            { id: "Shoulders", label: "Shoulders", group: "Muscle" },
        ],
    },
    {
        id: "PullDay",
        label: "Pull day",
        children: [
            ...SharedTags,
            { id: "Back", label: "Back", group: "Muscle" },
            { id: "Biceps", label: "Biceps", group: "Muscle" },
        ],
    },
    {
        id: "LegDay",
        label: "Leg day",
        children: [
            ...SharedTags,
            { id: "QuadFocus", label: "Quad focus", group: "Muscle" },
            { id: "GlutesFocus", label: "Glutes focus", group: "Muscle" },
        ],
    },
] as const;

export const CategoriesTags = uniquesByProp(
    Categories.reduce((acc, cat) => acc.concat(cat.children), []),
    "id"
) as Tag[];
export const CategoriesTagsById = groupIn(CategoriesTags, "id");
export const CategoriesTagGroups = uniques(
    Categories.reduce((acc, cat) => acc.concat(cat.children.flatMap((tag) => tag.group)), [])
) as string[];

export type Category = LiteralUnion<typeof Categories[number]["id"]>;
