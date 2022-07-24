import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
    Box,
    chakra,
    Table,
    TableCellProps,
    TableColumnHeaderProps,
    TableProps,
    TableRowProps,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
} from "@chakra-ui/react";
import {
    Cell,
    ColumnDef,
    CoreColumnDefAccessorFn,
    CoreColumnDefAccessorKey,
    CoreColumnDefBase,
    CoreColumnDefDisplay,
    CoreColumnDefDisplayWithStringHeader,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getSortedRowModel,
    Row,
    SortingState,
    TableOptions,
    useReactTable,
} from "@tanstack/react-table";
import { mergeProps, ObjectLiteral } from "pastable";
import { Fragment, ReactNode, useEffect } from "react";

export function DynamicTable<
    RowData extends ObjectLiteral,
    Columns extends TableOptions<RowData>["columns"] = TableOptions<RowData>["columns"]
>({
    columns,
    data,
    getHeaderProps,
    getCellProps,
    size = "sm",
    renderSubRow,
    isHeaderSticky,
    getRowProps,
    initialSortBy,
    hiddenColumns = [],
}: DynamicTableProps<RowData, Columns>) {
    const table = useReactTable<RowData>({
        columns,
        data,
        autoResetExpanded: false,
        renderFallbackValue: "--",
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        initialState: {
            columnVisibility: Object.fromEntries(hiddenColumns.map((id) => [id, false])),
            sorting: initialSortBy as SortingState,
        },
    });

    useEffect(() => {
        if (hiddenColumns?.length) {
            table.setColumnVisibility(Object.fromEntries(hiddenColumns.map((id) => [id, false])));
        }
    }, [hiddenColumns]);

    return (
        <Table size={size}>
            <Thead>
                {table.getHeaderGroups().map((headerGroup) => (
                    <Tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                            <Th
                                key={header.id}
                                colSpan={header.colSpan}
                                {...mergeProps((getHeaderProps?.(header.column, header.index) as any) || {}, {
                                    onClick: header.column.getToggleSortingHandler(),
                                })}
                                isNumeric={(header.column.columnDef.meta as any)?.isNumeric}
                                css={
                                    isHeaderSticky
                                        ? { position: "sticky", top: 0, backgroundColor: "white" }
                                        : undefined
                                }
                                bgColor="white"
                                zIndex={1}
                            >
                                <Box display="flex" alignItems="flex-end">
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() !== false && (
                                        <chakra.span pl="2" transform="translateY(-1px)">
                                            {header.column.getIsSorted() !== false ? (
                                                header.column.getIsSorted() === "desc" ? (
                                                    <TriangleDownIcon aria-label="sorted descending" />
                                                ) : (
                                                    <TriangleUpIcon aria-label="sorted ascending" />
                                                )
                                            ) : null}
                                        </chakra.span>
                                    )}
                                </Box>
                            </Th>
                        ))}
                    </Tr>
                ))}
            </Thead>
            <Tbody>
                {table.getRowModel().rows.map((row, rowIndex) => {
                    return (
                        <Fragment key={row.id}>
                            <Tr {...getRowProps?.(row, rowIndex)}>
                                {row.getVisibleCells().map((cell, cellIndex) => (
                                    <Td
                                        key={cell.id}
                                        isNumeric={(cell.column.columnDef.meta as any)?.isNumeric}
                                        {...((getCellProps?.(cell, rowIndex, cellIndex) as any) || {})}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </Td>
                                ))}
                            </Tr>
                            {renderSubRow && row.getIsExpanded() && (
                                <Tr>
                                    <Td colSpan={table.getVisibleFlatColumns().length}>{renderSubRow({ row })}</Td>
                                </Tr>
                            )}
                        </Fragment>
                    );
                })}
            </Tbody>
        </Table>
    );
}

export interface DynamicTableProps<
    RowData extends ObjectLiteral = any,
    Columns extends TableOptions<RowData>["columns"] = TableOptions<RowData>["columns"]
> extends Pick<TableProps, "size"> {
    columns: Columns;
    data: TableOptions<RowData>["data"];
    getHeaderProps?: (column: ColumnDef<RowData>, colIndex: number) => TableColumnHeaderProps;
    getRowProps?: (row: Row<RowData>, rowIndex: number) => TableRowProps;
    getCellProps?: (cell: Cell<RowData, any>, rowIndex: number, cellIndex: number) => TableCellProps;
    renderSubRow?: ({ row }: { row: Row<RowData> }) => ReactNode;
    isHeaderSticky?: boolean;
    hiddenColumns?: Array<ColumnId<Columns[number]>>;
    initialSortBy?: ReactTableSortBy<RowData>[];
}

export type ColumnId<ColumnD extends CoreColumnDefBase<any, any>> = ColumnD extends CoreColumnDefAccessorKey<
    any,
    any
> & {
    accessorKey: infer KeyId;
}
    ? KeyId
    : ColumnD extends CoreColumnDefAccessorFn<any, any> & {
          accessorFn: infer FnId;
      }
    ? FnId
    : ColumnD extends CoreColumnDefDisplayWithStringHeader<any, any> & {
          header: infer HeaderId;
      }
    ? HeaderId
    : ColumnD extends CoreColumnDefDisplay<any, any> & {
          id: infer Id;
      }
    ? Id
    : never;

type ReactTableSortBy<RowData extends ObjectLiteral = any> = { id: keyof RowData & {}; desc?: boolean };

export const makeColumns =
    <RowData extends ObjectLiteral = unknown>() =>
    <Column extends ColumnDef<RowData> = ColumnDef<RowData>>(columns: Array<Column>) =>
        columns;
