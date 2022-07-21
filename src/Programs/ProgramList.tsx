import { orm } from "@/orm";
import { Box } from "@chakra-ui/react";
import { Reorder, useMotionValue } from "framer-motion";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EditableProgramCard, EditableProgramCardProps } from "./ProgramCard";
import { ReorderItemBox } from "../components/ReorderItemBox";
import { Program } from "@/orm-types";

export function ProgramList({
    onEdit,
    programList,
}: Pick<EditableProgramCardProps, "onEdit"> & { programList: Program[] }) {
    const programIdList = useMemo(() => programList.map((p) => p.id), [programList]);
    const [items, setItems] = useState(programIdList);

    // Keep items up to date with programIdList whenever a program is created/deleted
    useEffect(() => {
        if (programIdList.join() === items.join()) return;

        setItems(programIdList);
    }, [programIdList]);

    const queryClient = useQueryClient();
    const mutation = useMutation((ordered: string[]) => orm.programListOrder.set(ordered), {
        onSuccess: () => queryClient.invalidateQueries([orm.program.name]),
    });

    return (
        <Box
            as={Reorder.Group}
            axis="y"
            values={items}
            onReorder={(newOrder) =>
                startTransition(() => setItems((current) => (newOrder.join() === current.join() ? current : newOrder)))
            }
            listStyleType="none"
            mb="6"
        >
            {items
                .filter((id) => programList.some((p) => p.id === id))
                .map((item) => (
                    <ReorderProgramCardItem
                        key={item}
                        program={programList.find((p) => p.id === item)}
                        onEdit={onEdit}
                        onAnimationComplete={() => mutation.mutate(items)}
                    />
                ))}
        </Box>
    );
}

export const ReorderProgramCardItem = ({
    program,
    onEdit,
    onAnimationComplete,
}: EditableProgramCardProps & { onAnimationComplete: () => void }) => {
    const y = useMotionValue(0);

    return (
        <ReorderItemBox
            value={program.id}
            my="15px"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            style={{ position: "relative", y }}
            whileDrag={{ scale: 1.1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}
            onAnimationComplete={(e: any) => e.scale === 1 && onAnimationComplete()}
        >
            <EditableProgramCard program={program} onEdit={onEdit} />
        </ReorderItemBox>
    );
};
