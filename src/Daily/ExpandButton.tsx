import { useCompactContext } from "@/store";
import { IconButton, IconButtonProps, useDisclosure, UseDisclosureProps } from "@chakra-ui/react";
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
    const [isCompact, setCompact] = useCompactContext();

    return <ExpandButton isActive={!isCompact} onClick={() => setCompact((current) => !current)} />;
}

/** 2 way binding: is controlled by isCompact value from context but also has it's own internal state */
export function useCompactState(props?: UseDisclosureProps) {
    const [isCompact] = useCompactContext();
    const toggle = useDisclosure({ defaultIsOpen: false, ...props });
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
