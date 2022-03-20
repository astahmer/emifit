const SharedTags = [
    { id: "Machine", label: "Machine", tag: "Type" },
    { id: "Freeweight", label: "Freeweight", tag: "Type" },
    { id: "Bodyweight", label: "Bodyweight", tag: "Type" },
] as const;

export const Categories = [
    {
        id: "PushDay",
        label: "Push day",
        children: [
            ...SharedTags,
            { id: "Chest", label: "Chest", tag: "Muscle" },
            { id: "Triceps", label: "Triceps", tag: "Muscle" },
            { id: "Shoulders", label: "Shoulders", tag: "Muscle" },
        ],
    },
    {
        id: "PullDay",
        label: "Pull day",
        children: [
            ...SharedTags,
            { id: "Back", label: "Back", tag: "Muscle" },
            { id: "Biceps", label: "Biceps", tag: "Muscle" },
        ],
    },
    {
        id: "LegDay",
        label: "Leg day",
        children: [
            ...SharedTags,
            { id: "QuadFocus", label: "Quad focus", tag: "Muscle" },
            { id: "GlutesFocus", label: "Glutes focus", tag: "Muscle" },
        ],
    },
] as const;
