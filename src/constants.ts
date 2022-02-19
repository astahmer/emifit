export const Categories = [
    {
        id: "PushDay",
        label: "Push day",
        children: [
            { id: "Chest", label: "Chest" },
            { id: "Triceps", label: "Triceps" },
            { id: "Shoulders", label: "Shoulders" },
        ],
    },
    {
        id: "PullDay",
        label: "Pull day",
        children: [
            { id: "Back", label: "Back" },
            { id: "Biceps", label: "Biceps" },
        ],
    },
    {
        id: "LegDay",
        label: "Leg day",
        children: [
            { id: "QuadFocus", label: "Quad focus" },
            { id: "GlutesFocus", label: "Glutes focus" },
        ],
    },
] as const;
