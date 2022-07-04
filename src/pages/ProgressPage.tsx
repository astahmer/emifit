import { CustomDay } from "@/components/CalendarButton";
import { Show } from "@/components/Show";
import { createContextWithHook } from "@/functions/createContextWithHook";
import { groupBy } from "@/functions/groupBy";
import { orm } from "@/orm";
import { useCategoryList, useDailyList } from "@/orm-hooks";
import { CheckIcon } from "@chakra-ui/icons";
import {
    Box,
    Button,
    Center,
    Heading,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Tag,
    TagLabel,
    TagLeftIcon,
    useDisclosure,
    useOutsideClick,
    VStack,
    Wrap,
    WrapItem,
} from "@chakra-ui/react";
import { SetState } from "@pastable/core";
import {
    Calendar,
    CalendarControls,
    CalendarDays,
    CalendarMonth,
    CalendarMonthName,
    CalendarMonths,
    CalendarNextButton,
    CalendarPrevButton,
    CalendarValues,
    CalendarWeek,
} from "@uselessdev/datepicker";
import { subMonths, subWeeks, subYears } from "date-fns";
import { MutableRefObject, ReactNode, useRef, useState } from "react";
import { useQuery } from "react-query";
import { Cell, Legend, Pie, PieChart, PieLabel, ResponsiveContainer } from "recharts";
import { match } from "ts-pattern";

export const ProgressPage = () => {
    const [activeRange, setActiveRange] = useState<RangePresetOrCustom>("Week");
    const [dates, setDates] = useState<CalendarValues>({
        start: activeRange !== "custom" ? getRangeStart(activeRange as RangePreset) : null,
        end: new Date(),
    });
    const rangeContainerRef = useRef<HTMLDivElement>();

    const query = useQuery(
        ["stats", "daily", dates],
        async () => {
            const tx = orm.db.transaction("daily");

            let cursor = await tx.store
                .index("by-time")
                .openCursor(IDBKeyRange.bound(new Date(dates.start).getTime(), new Date(dates.end).getTime()));

            const dailyList = [];
            while (cursor) {
                dailyList.push(cursor.value);

                cursor = await cursor.continue();
            }

            return dailyList;
        },
        { enabled: Boolean(dates.start && dates.end), staleTime: 5 * 60 * 1000 }
    );
    const dailyList = query.data || [];

    const categoryList = useCategoryList();
    const byCategory = groupBy(dailyList, (daily) => daily.category);

    const data = Object.entries(byCategory).map(([category, dailyList]) => ({
        name: categoryList.find((cat) => cat.id === category)?.name,
        value: dailyList.length,
    }));

    return (
        <Box id="ProgressPage" d="flex" flexDirection="column" h="100%" p="4" w="100%">
            <Heading as="h1">Progress</Heading>
            <CalendarValuesProvider value={{ ...dates, setDates }}>
                <Wrap ref={rangeContainerRef}>
                    {rangePresets.map((value) => (
                        <WrapItem key={value}>
                            <Tag
                                colorScheme="pink"
                                variant={value === activeRange ? "solid" : "subtle"}
                                onClick={() => {
                                    setActiveRange(value);
                                    setDates({ start: getRangeStart(value as RangePreset), end: new Date() });
                                }}
                            >
                                {value === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                                <TagLabel>{value}</TagLabel>
                            </Tag>
                        </WrapItem>
                    ))}
                    <WrapItem>
                        <CustomDateRangeCalendarButton
                            calendarRef={rangeContainerRef}
                            renderTrigger={({ onOpen }) => (
                                <Tag
                                    colorScheme="pink"
                                    variant={"custom" === activeRange ? "solid" : "subtle"}
                                    onClick={() => {
                                        if (activeRange !== "custom") {
                                            setActiveRange("custom");
                                            setDates({ start: null, end: null });
                                        }

                                        return onOpen();
                                    }}
                                >
                                    {"custom" === activeRange ? <TagLeftIcon boxSize="12px" as={CheckIcon} /> : null}
                                    <TagLabel>Custom</TagLabel>
                                </Tag>
                            )}
                        />
                    </WrapItem>
                </Wrap>
            </CalendarValuesProvider>
            <Box w="100%" h="300px" mt="2">
                <Show
                    when={Boolean(data.length)}
                    fallback={
                        <Center h="100%">
                            <Spinner size="xl" />
                        </Center>
                    }
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                            <Pie
                                animationDuration={400}
                                onAnimationStart={() => console.log("start")}
                                onAnimationEnd={() => console.log("end")}
                                data={data}
                                // cx={rect.width / 2 - 10}
                                // cy={rect.width / 2 - 10}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                                label={renderCustomizedLabel}
                            >
                                {data.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Legend verticalAlign="bottom" height={26} align="center" />
                        </PieChart>
                    </ResponsiveContainer>
                </Show>
            </Box>
        </Box>
    );
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
const RADIAN = Math.PI / 180;

const renderCustomizedLabel: PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, ...props }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "middle"} dominantBaseline="central">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

const getRangeStart = (preset: RangePreset) => {
    const today = new Date();
    return match(preset)
        .with("Week", () => subWeeks(today, 1))
        .with("1m", () => subMonths(today, 1))
        .with("3m", () => subMonths(today, 3))
        .with("6m", () => subMonths(today, 3))
        .with("1y", () => subYears(today, 3))
        .exhaustive();
};

const rangePresets = ["Week", "1m", "3m", "6m", "1y"] as const;
type RangePresetOrCustom = typeof rangePresets[number] | "custom";
type RangePreset = Exclude<RangePresetOrCustom, "custom">;

const [CalendarValuesProvider, useCalendarValues] = createContextWithHook<
    CalendarValues & { setDates: SetState<CalendarValues> }
>("CalendarValues");

const CustomDateRangeCalendarButton = ({
    renderTrigger,
    calendarRef,
}: {
    renderTrigger: (props: { onOpen: () => void }) => ReactNode;
    calendarRef: MutableRefObject<HTMLDivElement>;
}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    useOutsideClick({ ref: calendarRef, handler: onClose, enabled: isOpen });

    return (
        <Popover placement="auto-start" isOpen={isOpen}>
            <PopoverTrigger>{renderTrigger({ onOpen })}</PopoverTrigger>
            <PopoverContent
                p={0}
                w="min-content"
                border="none"
                outline="none"
                _focus={{ boxShadow: "none" }}
                ref={calendarRef}
            >
                <TwoMonthsDateRangeCalendar onSelectDates={onClose} />
            </PopoverContent>
        </Popover>
    );
};

const MONTHS = 2;
const TwoMonthsDateRangeCalendar = ({ onSelectDates }: { onSelectDates: (dates: CalendarValues) => void }) => {
    const dailyList = useDailyList();
    const { setDates, ...dates } = useCalendarValues();
    const handleSelectDate = (dates: CalendarValues) => {
        console.log(dates);
        setDates(dates);
        if (dates.start && dates.end) {
            onSelectDates(dates);
        }
    };
    const categoryList = useCategoryList();

    return (
        <Calendar value={dates} onSelectDate={handleSelectDate} months={MONTHS} disableFutureDates>
            <Box d="flex" flexDir="column">
                <Box position="relative">
                    <CalendarControls>
                        <CalendarPrevButton />
                        <CalendarNextButton />
                    </CalendarControls>

                    <CalendarMonths gridTemplate="1fr 1fr / 1fr">
                        {[...Array(MONTHS).keys()].map((month) => (
                            <CalendarMonth month={month} key={month}>
                                <CalendarMonthName />
                                <CalendarWeek />
                                <CalendarDays>
                                    <CustomDay {...{ dailyList, categoryList }} />
                                </CalendarDays>
                            </CalendarMonth>
                        ))}
                    </CalendarMonths>
                </Box>
                <VStack spacing={4} bgColor="gray.50" p={4} alignItems="stretch" borderEndRadius="md" flex={1}>
                    <Button
                        onClick={() => setDates({ start: null, end: null })}
                        colorScheme="pink"
                        size="md"
                        disabled={!Boolean(dates.start || dates.end)}
                    >
                        Reset range
                    </Button>
                </VStack>
            </Box>
        </Calendar>
    );
};
