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
} from "@chakra-ui/react";
import { isDefined } from "@pastable/core";
import { Fragment, ReactNode } from "react";
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
}: DynamicTableProps) {
    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, visibleColumns } = useTable(
        { columns, data, autoResetExpanded: false, defaultColumn } as TableOptions<UseExpandedOptions<{}>>,
        useSortBy,
        useExpanded
    );

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
                                {column.render("Header", getHeaderProps?.(column, colIndex))}
                                {(column as any).canBeSorted !== false && (
                                    <chakra.span pl="4">
                                        {(column as any).isSorted ? (
                                            (column as any).isSortedDesc ? (
                                                <TriangleDownIcon aria-label="sorted descending" />
                                            ) : (
                                                <TriangleUpIcon aria-label="sorted ascending" />
                                            )
                                        ) : null}
                                    </chakra.span>
                                )}
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

export interface DynamicTableProps extends Pick<TableProps, "size"> {
    columns: TableOptions<{}>["columns"];
    data: TableOptions<{}>["data"];
    getHeaderProps?: (column: Column, colIndex: number) => TableColumnHeaderProps;
    getRowProps?: (row: Column, rowIndex: number) => TableRowProps;
    getCellProps?: (cell: Cell, rowIndex: number, cellIndex: number) => TableCellProps;
    renderSubRow?: ({ row }: { row: Row }) => ReactNode;
    isHeaderSticky?: boolean;
}

const defaultColumn = { Cell: ({ cell: { value } }) => (isDefined(value) ? String(value) : "--") };
