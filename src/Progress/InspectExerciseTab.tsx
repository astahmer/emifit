import { useParams } from "react-router-dom";

export const InspectExerciseTab = () => {
    const { exoId } = useParams();
    return <>{exoId}</>;
};
