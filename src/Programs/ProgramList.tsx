import { orm } from "@/orm";
import { setProgramsOrder, useProgramList } from "@/store";
import { Box, type BoxProps } from "@chakra-ui/react";
import { Reorder, useMotionValue } from "framer-motion";
import { ComponentProps, forwardRef, ForwardRefExoticComponent, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { ProgramCard, ProgramCardProps } from "./ProgramsCard";

export function ProgramList({ onEdit }: Pick<ProgramCardProps, "onEdit">) {
    const programs = useProgramList();
    const programIdList = useMemo(() => programs.map((p) => p.id), [programs]);
    const [items, setItems] = useState(programIdList);

    // Keep items up to date with programIdList whenever a program is created/deleted
    useEffect(() => {
        if (programIdList.length === items.length) return;
        if (programIdList.join() === items.join()) return;

        setItems(programIdList);
    }, [programIdList]);

    const queryClient = useQueryClient();
    const mutation = useMutation((ordered: string[]) => setProgramsOrder(ordered), {
        onSuccess: () => queryClient.invalidateQueries(orm.program.key),
    });

    return (
        <Box as={Reorder.Group} axis="y" values={items} onReorder={setItems} listStyleType="none" mb="6">
            {items
                .filter((id) => programs.some((p) => p.id === id))
                .map((item) => (
                    <ReorderProgramCardItem
                        key={item}
                        program={programs.find((p) => p.id === item)}
                        onEdit={onEdit}
                        onAnimationComplete={() => mutation.mutate(items)}
                    />
                ))}
        </Box>
    );
}

type ReorderItemBoxComponent = ForwardRefExoticComponent<ComponentProps<typeof Reorder.Item> & Omit<BoxProps, "style">>;
const ReorderItemBox = forwardRef<HTMLDivElement, BoxProps & ComponentProps<typeof Reorder.Item>>((props, ref) => (
    <Box ref={ref} {...props} as={Reorder.Item} />
)) as ReorderItemBoxComponent;

export const ReorderProgramCardItem = ({
    program,
    onEdit,
    onAnimationComplete,
}: ProgramCardProps & { onAnimationComplete?: () => void }) => {
    const y = useMotionValue(0);

    return (
        <ReorderItemBox
            value={program.id}
            id={program.id}
            my="15px"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            style={{ position: "relative", y }}
            whileDrag={{ scale: 1.1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}
            onAnimationComplete={(e: any) => e.scale === 1 && onAnimationComplete()}
        >
            <ProgramCard program={program} onEdit={onEdit} />
        </ReorderItemBox>
    );
};
