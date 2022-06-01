import { WithChildren } from "@pastable/core";
import { ReactElement, ReactNode } from "react";

export function Show({
    when,
    children,
    fallback,
}: WithChildren & { when: boolean; fallback?: ReactNode }): ReactElement | null {
    return when ? (children as ReactElement) : (fallback as any) || null;
}
