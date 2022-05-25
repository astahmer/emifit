import type { Category } from "./constants";
import { LiteralUnion } from "./types";

export interface Exercise {
    id: string;
    category: Category;
    name: string;
    tags: Tag[];
    series: Serie[];
    createdAt: Date;
    madeFromExerciseId?: string;
    /** if made within Y superset */
    supersetId?: Program["id"] | null;
}
export interface Serie {
    id: string;
    kg: number;
    reps: number;
    kind: LiteralUnion<"warmup">;
}

export interface Tag {
    id: string;
    label: string;
    group: string;
}

export interface Program {
    id: string;
    name: string;
    category: Category;
    exerciseList: Exercise[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Daily {
    id: string;
    date: Date;
    time: number;
    category: Category;
    exerciseList: Exercise[];
    /** Completed exerciseId list */
    completedList: Array<Exercise["id"]>;
    /** if made from X program */
    programId?: Program["id"] | null;
    hasDoneCardio?: boolean;
    metadata?: string[];
}

export interface DailyWithReferences extends Omit<Daily, "exerciseList"> {
    exerciseList: Exercise["id"][];
}
export interface ProgramWithReferences extends Omit<Program, "exerciseList"> {
    exerciseList: Exercise["id"][];
}
export interface ExerciseWithReferences extends Omit<Exercise, "tags"> {
    tags: Tag["id"][];
}

export interface WithExerciseList {
    exerciseList: Exercise[];
}
