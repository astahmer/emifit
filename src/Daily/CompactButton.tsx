import { isCompactViewAtom } from "@/store";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { useAtom } from "jotai";
import { IoMdExpand } from "react-icons/io";
import { MdOutlineViewCompact } from "react-icons/md";

export function ExpandButton(props: Partial<IconButtonProps>) {
    return (
        <IconButton
            size="xs"
            aria-label="Compact grid view"
            icon={props.isActive ? <IoMdExpand /> : <MdOutlineViewCompact />}
            colorScheme={props.isActive ? "pink" : undefined}
            {...props}
        />
    );
}

export function CompactViewButton() {
    const [isCompact, setCompact] = useAtom(isCompactViewAtom);

    return <ExpandButton isActive={isCompact} onClick={() => setCompact((current) => !current)} />;
}
