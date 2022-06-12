import { RadioCardButton } from "@/components/RadioCard";
import { currentDateAtom } from "@/store";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ButtonProps } from "@chakra-ui/react";
import { useSetAtom } from "jotai";

export const GoBackToTodayEntryButton = (props: ButtonProps) => {
    const setCurrentDate = useSetAtom(currentDateAtom);
    return (
        <RadioCardButton {...props} onClick={() => setCurrentDate(new Date())} variant="solid">
            Go back to today's entry
            <ChevronRightIcon />
        </RadioCardButton>
    );
};
