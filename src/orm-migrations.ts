import { IDBPDatabase, IDBPTransaction, StoreNames } from "idb";
import { slugify } from "./functions/utils";
import type { EmifitSchema } from "./orm";
import type { Tag } from "./orm-types";

export const runMigrations: (
    database: IDBPDatabase<EmifitSchema>,
    oldVersion: number,
    newVersion: number | null,
    transaction: IDBPTransaction<EmifitSchema, StoreNames<EmifitSchema>[], "versionchange" | "readwrite">,
    importData?: (
        currentVersion: number,
        tx: IDBPTransaction<EmifitSchema, StoreNames<EmifitSchema>[], "versionchange" | "readwrite">
    ) => void | Promise<void>
) => Promise<void> = async (db, oldVersion, newVersion, transaction, importData) => {
    let migrationVersion = oldVersion;

    const isVersionChange = transaction.mode === "versionchange";
    console.log({ db, oldVersion, newVersion, transaction, migrationVersion, isVersionChange });

    const tx = transaction;

    console.log("start migrating");

    if (!isVersionChange && importData) {
        console.log("import: running migrations at version", migrationVersion);
        await importData(migrationVersion, tx);
    }

    if (migrationVersion === 0 && isVersionChange) {
        console.log("create db object stores");
        const daily = db.createObjectStore("daily", { keyPath: "id" });
        daily.createIndex("by-time", "time");
        daily.createIndex("by-category", "category");
        daily.createIndex("by-program", "programId");

        const exercise = db.createObjectStore("exercise", { keyPath: "id" });
        exercise.createIndex("by-name", "name");
        exercise.createIndex("by-category", "category");
        exercise.createIndex("by-tags", "tags", { multiEntry: true });
        exercise.createIndex("by-parent", "madeFromExerciseId");

        const program = db.createObjectStore("program", { keyPath: "id" });
        program.createIndex("by-name", "name");
        program.createIndex("by-category", "category");

        db.createObjectStore("keyval");
        migrationVersion++;
        console.log("migrated to version", migrationVersion);
    }
    if (migrationVersion === 1) {
        let cursor = await tx.objectStore("daily").index("by-time").openCursor();

        while (cursor) {
            if (typeof cursor.value.date === "string") {
                cursor.update({ ...cursor.value, date: new Date(cursor.value.date) });
            }

            cursor = await cursor.continue();
        }
        migrationVersion++;
        console.log("migrated to version", migrationVersion, "cast daily.date string to Date");
    }

    // nothing changed between v2 -> v13
    if (migrationVersion >= 2 && migrationVersion <= 12) migrationVersion = 13;

    if (migrationVersion === 13) {
        const program = await tx.objectStore("program").getAll();
        const exerciseList = await tx.objectStore("exercise").getAll();
        const exerciseMap = new Map(exerciseList.map((e) => [e.id, e]));

        for (const p of program) {
            await Promise.all(
                p.exerciseList.map((exo) =>
                    tx.objectStore("exercise").put({ ...exerciseMap.get(exo), programId: p.id })
                )
            );
        }
        migrationVersion++;
        console.log("migrated to version", migrationVersion, "add programId to exercises created from program");
    }

    // nothing changed between v13 -> v24
    if (migrationVersion >= 13 && migrationVersion < 24) migrationVersion = 24;

    if (migrationVersion === 24) {
        const exerciseList = await tx.objectStore("exercise").getAll();

        const removedTagId = "CBarbell";
        const renamedTagId = "Barebell";

        const exerciseListWithRemovedTag = exerciseList.filter((e) => e.tags.some((t) => t === removedTagId));
        const exerciseListWithRenamedTag = exerciseList.filter((e) => e.tags.some((t) => t === renamedTagId));
        console.log({ exerciseList, exerciseListWithRemovedTag, exerciseListWithRenamedTag });

        await Promise.all(
            (exerciseListWithRemovedTag || []).map((exo) =>
                tx.objectStore("exercise").put({ ...exo, tags: exo.tags.filter((t) => t !== removedTagId) })
            )
        );
        await Promise.all(
            (exerciseListWithRenamedTag || []).map((exo) =>
                tx
                    .objectStore("exercise")
                    .put({ ...exo, tags: exo.tags.filter((t) => t !== renamedTagId).concat("Barbell") })
            )
        );

        console.log("migrated to version", migrationVersion, "rm CBarbell & rename Barebell to -> Barbell");
        migrationVersion++;
    }

    if (migrationVersion === 25 && isVersionChange) {
        const group = db.createObjectStore("group", { keyPath: "id" });
        group.createIndex("by-name", "name");

        const tag = db.createObjectStore("tag", { keyPath: "id" });
        tag.createIndex("by-name", "name");
        tag.createIndex("by-group", "groupId");

        const category = db.createObjectStore("category", { keyPath: "id" });
        category.createIndex("by-name", "name");

        // Add default values
        await Promise.all([group.add({ id: "Type", name: "Type" }), group.add({ id: "Muscle", name: "Muscle" })]);

        const SharedTags = [
            { id: "Machine", name: "Machine", groupId: "Type" },
            { id: "Freeweight", name: "Freeweight", groupId: "Type" },
            { id: "Bodyweight", name: "Bodyweight", groupId: "Type" },
            { id: "Barbell", name: "Barbell", groupId: "Type" },
            { id: "Dumbbell", name: "Dumbbell", groupId: "Type" },
            { id: "Poulie", name: "Poulie", groupId: "Type" },
        ];
        const PushDayTags = [
            { id: "Chest", name: "Chest", groupId: "Muscle" },
            { id: "Triceps", name: "Triceps", groupId: "Muscle" },
            { id: "Shoulders", name: "Shoulders", groupId: "Muscle" },
        ];
        const PullDayTags = [
            { id: "Back", name: "Back", groupId: "Muscle" },
            { id: "Biceps", name: "Biceps", groupId: "Muscle" },
        ];
        const LegDayTags = [
            { id: "QuadFocus", name: "Quad focus", groupId: "Muscle" },
            { id: "GlutesFocus", name: "Glutes focus", groupId: "Muscle" },
        ];

        const defaultTagList: Tag[] = [...SharedTags, ...PushDayTags, ...PullDayTags, ...LegDayTags];
        await Promise.all(defaultTagList.map((t) => tag.add(t)));

        await Promise.all([
            category.add({ id: "PushDay", name: "Push day", tagList: PushDayTags.concat(SharedTags).map((t) => t.id) }),
            category.add({ id: "PullDay", name: "Pull day", tagList: PullDayTags.concat(SharedTags).map((t) => t.id) }),
            category.add({ id: "LegDay", name: "Leg day", tagList: LegDayTags.concat(SharedTags).map((t) => t.id) }),
        ]);

        console.log("migrated to version", migrationVersion, "make object stores for Category/Tag");
        migrationVersion++;
    }

    // nothing changed between v25 -> v44
    if (migrationVersion >= 25 && migrationVersion < 45) migrationVersion = 45;

    // Add exercise "by-created-date" index
    if (migrationVersion === 45) {
        if (isVersionChange) {
            const exerciseStore = tx.objectStore("exercise");
            if (!exerciseStore.indexNames.contains("by-created-date")) {
                exerciseStore.createIndex("by-created-date", "createdAt");
            }
            console.log("migrated to version", migrationVersion, `Add exercise "by-created-date" index`);
        }
        migrationVersion++;
    }

    // Format existing exercises to have a createdAt date as a Date object
    if (migrationVersion === 46) {
        let cursor = await tx.objectStore("exercise").openCursor();

        while (cursor) {
            if (typeof cursor.value.createdAt === "string") {
                cursor.update({ ...cursor.value, createdAt: new Date(cursor.value.createdAt) });
            }

            cursor = await cursor.continue();
        }
        console.log(
            "migrated to version",
            migrationVersion,
            `Format existing exercises to have a createdAt date as a Date object`
        );
        migrationVersion++;
    }
    // Format existing exercises to have a "dailyId" & "from" properties
    if (migrationVersion === 47) {
        let programCursor = await tx.objectStore("program").openCursor();

        while (programCursor) {
            let exoCursor = await tx.objectStore("exercise").openCursor();
            while (exoCursor) {
                if (programCursor.value.exerciseList.includes(exoCursor.value.id)) {
                    exoCursor.update({
                        ...exoCursor.value,
                        programId: programCursor.value.id,
                        from: programCursor.value.madeFromProgramId ? "program" : "program",
                    });
                }
                exoCursor = await exoCursor.continue();
            }

            programCursor = await programCursor.continue();
        }

        let dailyCursor = await tx.objectStore("daily").openCursor();

        while (dailyCursor) {
            let exoCursor = await tx.objectStore("exercise").openCursor();
            while (exoCursor) {
                if (dailyCursor.value.exerciseList.includes(exoCursor.value.id)) {
                    exoCursor.update({ ...exoCursor.value, dailyId: dailyCursor.value.id, from: "daily" });
                }
                exoCursor = await exoCursor.continue();
            }

            dailyCursor = await dailyCursor.continue();
        }

        console.log(
            "migrated to version",
            migrationVersion,
            `Format existing exercises to have a "dailyId" & "from" properties`
        );
        migrationVersion++;
    }

    if (migrationVersion === 48) {
        if (isVersionChange) {
            const exerciseStore = tx.objectStore("exercise");
            if (!exerciseStore.indexNames.contains("by-from")) {
                exerciseStore.createIndex("by-from", "from");
            }
            if (!exerciseStore.indexNames.contains("by-daily")) {
                exerciseStore.createIndex("by-daily", "dailyId");
            }
            if (!exerciseStore.indexNames.contains("by-program")) {
                exerciseStore.createIndex("by-program", "programId");
            }
            console.log(
                "migrated to version",
                migrationVersion,
                "Add exercise 'by-from', 'by-daily', 'by-program' indexes"
            );
        }
        migrationVersion++;
    }

    // Add exercise.slug + fix exercise.name by trimming whitespaces
    if (migrationVersion === 49) {
        let exerciseCursor = await tx.objectStore("exercise").openCursor();

        while (exerciseCursor) {
            const name = exerciseCursor.value.name.trim();
            exerciseCursor.update({ ...exerciseCursor.value, name, slug: slugify(name) });
            exerciseCursor = await exerciseCursor.continue();
        }

        console.log(
            "migrated to version",
            migrationVersion,
            `Add exercise.slug + fix exercise.name by trimming whitespaces`
        );
        migrationVersion++;
    }
    // Add exercise.slug index
    if (migrationVersion === 50) {
        if (isVersionChange) {
            const exerciseStore = tx.objectStore("exercise");
            if (!exerciseStore.indexNames.contains("by-slug")) {
                exerciseStore.createIndex("by-slug", "slug");
            }

            console.log("migrated to version", migrationVersion, `Add exercise.slug index`);
        }
        migrationVersion++;
    }

    // Add exercise.superset index
    if (migrationVersion === 51) {
        if (isVersionChange) {
            const exerciseStore = tx.objectStore("exercise");
            if (!exerciseStore.indexNames.contains("by-superset")) {
                exerciseStore.createIndex("by-superset", "supersetId");
            }

            console.log("migrated to version", migrationVersion, `Add exercise.superset index`);
        }
        migrationVersion++;
    }

    // nothing changed between v51 -> v59
    if (migrationVersion >= 51 && migrationVersion <= 58) migrationVersion = 59;

    // Add exercise.from = daily / exercise.dailyId when missing
    if (migrationVersion === 59) {
        let dailyCursor = await tx.objectStore("daily").openCursor();

        while (dailyCursor) {
            let exoCursor = await tx.objectStore("exercise").openCursor();
            while (exoCursor) {
                if (dailyCursor.value.exerciseList.includes(exoCursor.value.id)) {
                    if (!exoCursor.value.from || !exoCursor.value.dailyId) {
                        exoCursor.update({ ...exoCursor.value, dailyId: dailyCursor.value.id, from: "daily" });
                    }
                }
                exoCursor = await exoCursor.continue();
            }

            dailyCursor = await dailyCursor.continue();
        }

        console.log(
            "migrated to version",
            migrationVersion,
            `Add exercise.from = daily / exercise.dailyId when missing`
        );
        migrationVersion++;
    }

    console.log("done migrating");
};
