import { useProgramList } from "@/store";
import { Box, type BoxProps } from "@chakra-ui/react";
import { Reorder, useMotionValue } from "framer-motion";
import { ComponentProps, forwardRef, ForwardRefExoticComponent, useState } from "react";
import { ProgramCard, ProgramCardProps } from "./ProgramsCard";

export function ProgramList({ onEdit }: Pick<ProgramCardProps, "onEdit">) {
    const programs = useProgramList();
    const [items, setItems] = useState(programs.map((p) => p.id));
    console.log(programs.length, items.length);
    // TODO setItems = persist program orders
    // TODO keep items up to date with program list
    return (
        <Box
            as={Reorder.Group}
            axis="y"
            values={items}
            onReorder={setItems}
            listStyleType="none"
            overflow="auto"
            mb="6"
        >
            {items.map((item) => (
                <ReorderProgramCardItem key={item} program={programs.find((p) => p.id === item)} onEdit={onEdit} />
            ))}
        </Box>
    );
}

type ReorderItemBoxComponent = ForwardRefExoticComponent<ComponentProps<typeof Reorder.Item> & Omit<BoxProps, "style">>;
const ReorderItemBox = forwardRef<HTMLDivElement, BoxProps & ComponentProps<typeof Reorder.Item>>((props, ref) => (
    <Box ref={ref} {...props} as={Reorder.Item} />
)) as ReorderItemBoxComponent;

export const ReorderProgramCardItem = ({ program, onEdit }: ProgramCardProps) => {
    const y = useMotionValue(0);

    return (
        <ReorderItemBox
            value={program.id}
            id={program.id}
            my="15px"
            boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            style={{ position: "relative", y }}
            whileDrag={{ scale: 1.1, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)" }}
        >
            <ProgramCard program={program} onEdit={onEdit} />
        </ReorderItemBox>
    );
};
