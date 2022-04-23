import { RadioCardButton } from "@/components/RadioCard";
import { currentDateAtom } from "@/store";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { useSetAtom } from "jotai";

export const GoBackToTodayEntryButton = () => {
    const setCurrentDate = useSetAtom(currentDateAtom);
    return (
        <RadioCardButton onClick={() => setCurrentDate(new Date())}>
            Go back to today's entry
            <ChevronRightIcon />
        </RadioCardButton>
    );
};
