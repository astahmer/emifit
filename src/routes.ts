export const routeMap = {
    home: "*",
    exercise: {
        add: "exercise/add",
        edit: "exercise/edit/:id",
    },
    progress: "progress",
    settings: "settings",
    programs: "programs/*",
} as const;
