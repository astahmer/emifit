export interface Exercise {
    id: string;
    category: string;
    name: string;
    tags: Tag[];
    series: Serie[];
    createdAt: Date | number;
    madeFromExerciseId?: string;
}
export interface Serie {
    id: string;
    kg: number;
    reps: number;
}

interface Tag {
    id: string;
    label: string;
}

export interface Program {
    id: string;
    name: string;
    category: string;
    exerciseList: Exercise[];
    createdAt: Date | number;
    updatedAt: Date | number;
    // TODO exerciseOrderList: string[]
}

export interface Daily {
    id: string;
    date: Date | number;
    category: string;
    exerciseList: Exercise[];
    /** Completed exerciseId list */
    completedList: Array<Exercise["id"]>;
    /** if made from X program */
    programId?: Program["id"] | null;
    /** ex: cardio done yes/no */
    metadata?: string[];
}
