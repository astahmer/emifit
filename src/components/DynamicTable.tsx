import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import {
    Table,
    TableProps,
    Tbody,
    Td,
    Th,
    Thead,
    Tr,
    chakra,
    TableRowProps,
    TableColumnHeaderProps,
    TableCellProps,
    Box,
} from "@chakra-ui/react";
import { isDefined, ObjectLiteral } from "pastable";
import { Fragment, ReactNode, useEffect } from "react";
import { Cell, Column, Row, TableOptions, UseExpandedOptions, useExpanded, useSortBy, useTable } from "react-table";

export function DynamicTable({
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
}: DynamicTableProps) {
    const table = useTable(
        {
            columns,
            data,
            autoResetExpanded: false,
            defaultColumn,
            initialState: { hiddenColumns, sortBy: initialSortBy || [] },
        } as TableOptions<UseExpandedOptions<{}>>,
        useSortBy,
        useExpanded
    );
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns } = table;

    useEffect(() => {
        if (hiddenColumns?.length) {
            table.setHiddenColumns(hiddenColumns);
        }
    }, [hiddenColumns]);

    return (
        <Table {...getTableProps()} size={size}>
            <Thead>
                {headerGroups.map((headerGroup) => (
                    <Tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map((column, colIndex) => (
                            <Th
                                {...column.getHeaderProps(
                                    (column as any).canBeSorted !== false ? (column as any).getSortByToggleProps() : {}
                                )}
                                isNumeric={(column as any).isNumeric}
                                css={
                                    isHeaderSticky
                                        ? { position: "sticky", top: 0, backgroundColor: "white" }
                                        : undefined
                                }
                            >
                                <Box display="flex" alignItems="flex-end">
                                    {column.render("Header", getHeaderProps?.(column, colIndex))}
                                    {(column as any).canBeSorted !== false && (
                                        <chakra.span pl="2" transform="translateY(-1px)">
                                            {(column as any).isSorted ? (
                                                (column as any).isSortedDesc ? (
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
            <Tbody {...getTableBodyProps()}>
                {rows.map((row, rowIndex) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps(getRowProps?.(row, rowIndex));
                    return (
                        <Fragment key={key}>
                            <Tr key={key} {...rowProps}>
                                {row.cells.map((cell, cellIndex) => (
                                    <Td {...cell.getCellProps()} isNumeric={(cell.column as any).isNumeric}>
                                        {cell.render("Cell", getCellProps?.(cell, rowIndex, cellIndex))}
                                    </Td>
                                ))}
                            </Tr>
                            {renderSubRow && (row as any).isExpanded && (
                                <Tr>
                                    <Td colSpan={visibleColumns.length}>{renderSubRow({ row })}</Td>
                                </Tr>
                            )}
                        </Fragment>
                    );
                })}
            </Tbody>
        </Table>
    );
}

export interface DynamicTableProps<RowData extends ObjectLiteral = any> extends Pick<TableProps, "size"> {
    columns: TableOptions<RowData>["columns"];
    data: TableOptions<RowData>["data"];
    getHeaderProps?: (column: Column, colIndex: number) => TableColumnHeaderProps;
    getRowProps?: (row: Column, rowIndex: number) => TableRowProps;
    getCellProps?: (cell: Cell, rowIndex: number, cellIndex: number) => TableCellProps;
    renderSubRow?: ({ row }: { row: Row }) => ReactNode;
    isHeaderSticky?: boolean;
    hiddenColumns?: string[];
    initialSortBy?: ReactTableSortBy<RowData>[];
}

type ReactTableSortBy<RowData extends ObjectLiteral = any> = { id: keyof RowData & {}; desc?: boolean };

const defaultColumn = { Cell: ({ cell: { value } }) => (isDefined(value) ? String(value) : "--") };
