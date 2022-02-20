const SharedTags = [
    { id: "Machine", label: "Machine" },
    { id: "Freeway", label: "Freeway" },
    { id: "Bodyweight", label: "Bodyweight" },
] as const;

export const Categories = [
    {
        id: "PushDay",
        label: "Push day",
        children: [
            ...SharedTags,
            { id: "Chest", label: "Chest" },
            { id: "Triceps", label: "Triceps (yes)" },
            { id: "Shoulders", label: "Shoulders" },
        ],
    },
    {
        id: "PullDay",
        label: "Pull day",
        children: [...SharedTags, { id: "Back", label: "Back" }, { id: "Biceps", label: "Biceps" }],
    },
    {
        id: "LegDay",
        label: "Leg day",
        children: [
            ...SharedTags,
            { id: "QuadFocus", label: "Quad focus" },
            { id: "GlutesFocus", label: "Glutes focus" },
        ],
    },
] as const;
