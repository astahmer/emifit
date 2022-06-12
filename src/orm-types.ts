import { LiteralUnion } from "./types";

export interface Group {
    id: string;
    name: string;
}

export interface Category {
    id: string;
    name: string;
    tagList: Tag[];
    canSeeEveryExercises?: boolean;
    color?: string;
}

export interface Exercise {
    id: string;
    category: Category["id"];
    name: string;
    tags: Tag[];
    series: Serie[];
    createdAt: Date;
    madeFromExerciseId?: string;
    /** if made within Y superset */
    supersetId?: Program["id"] | null;
    /** if made from X program */
    programId?: Program["id"] | null;
}
export interface Serie {
    id: string;
    kg: number;
    reps: number;
    kind: LiteralUnion<"warmup">;
}

export interface Tag {
    id: string;
    name: string;
    groupId: Group["id"];
    color?: string; // TODO
}

export interface Program {
    id: string;
    name: string;
    category: Category["id"];
    exerciseList: Exercise[];
    createdAt: Date;
    updatedAt: Date;
    madeFromProgramId?: string;
}

export interface Daily {
    id: string;
    date: Date;
    time: number;
    category: Category["id"];
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

export interface CategoryWithReferences extends Omit<Category, "tagList"> {
    tagList: Tag["id"][];
}

export interface TagWithReferences extends Tag {}
export interface GroupWithReferences extends Group {}

export interface WithExerciseList {
    exerciseList: Exercise[];
}
