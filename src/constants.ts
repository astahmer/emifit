const SharedTags = [
    { id: "Machine", label: "Machine", catId: "Shared" },
    { id: "Freeweight", label: "Freeweight", catId: "Shared" },
    { id: "Bodyweight", label: "Bodyweight", catId: "Shared" },
] as const;

export const Categories = [
    {
        id: "PushDay",
        label: "Push day",
        children: [
            ...SharedTags,
            { id: "Chest", label: "Chest", catId: "PushDay" },
            { id: "Triceps", label: "Triceps", catId: "PushDay" },
            { id: "Shoulders", label: "Shoulders", catId: "PushDay" },
        ],
    },
    {
        id: "PullDay",
        label: "Pull day",
        children: [
            ...SharedTags,
            { id: "Back", label: "Back", catId: "PullDay" },
            { id: "Biceps", label: "Biceps", catId: "PullDay" },
        ],
    },
    {
        id: "LegDay",
        label: "Leg day",
        children: [
            ...SharedTags,
            { id: "QuadFocus", label: "Quad focus", catId: "LegDay" },
            { id: "GlutesFocus", label: "Glutes focus", catId: "LegDay" },
        ],
    },
] as const;
