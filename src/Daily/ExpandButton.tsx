import { isCompactViewAtom } from "@/store";
import { IconButton, IconButtonProps, useDisclosure } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useRef } from "react";
import { IoMdExpand } from "react-icons/io";
import { MdOutlineViewCompact } from "react-icons/md";

export function ExpandButton(props: Partial<IconButtonProps>) {
    return (
        <IconButton
            size="xs"
            aria-label="Compact grid view"
            icon={!props.isActive ? <IoMdExpand /> : <MdOutlineViewCompact />}
            colorScheme={!props.isActive ? "pink" : undefined}
            {...props}
        />
    );
}

export function CompactViewButton() {
    const [isCompact, setCompact] = useAtom(isCompactViewAtom);

    return <ExpandButton isActive={!isCompact} onClick={() => setCompact((current) => !current)} />;
}

export function useCompactState() {
    const isCompact = useAtomValue(isCompactViewAtom);
    const toggle = useDisclosure({ defaultIsOpen: false });
    const isHidden = !toggle.isOpen;

    const isFirstRenderRef = useRef(true);
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }

        if (!isCompact) {
            toggle.onOpen();
        } else {
            toggle.onClose();
        }
    }, [isCompact]);

    return { ...toggle, isHidden };
}
