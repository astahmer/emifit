import { RadioCardButton } from "@/fields/RadioCard";
import { currentDateAtom } from "@/store";
import { ChevronLeftIcon } from "@chakra-ui/icons";
import { ButtonProps } from "@chakra-ui/react";
import { useSetAtom } from "jotai";
import { useMutation } from "react-query";
import { useLastFilledDailyDate } from "./useLastFilledDailyDate";

export const GoToClosestPreviousDailyEntryButton = (props: ButtonProps) => {
    const setCurrentDate = useSetAtom(currentDateAtom);
    const lastFilledDaily = useLastFilledDailyDate();
    const mutation = useMutation(() => void setCurrentDate(lastFilledDaily));

    return (
        <RadioCardButton {...props} onClick={mutation.mutate.bind(undefined)}>
            <ChevronLeftIcon />
            Go to the closest previous daily entry
        </RadioCardButton>
    );
};
