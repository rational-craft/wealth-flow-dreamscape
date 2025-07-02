import React, { useCallback, useMemo, useState } from "react";
import DataGrid, { Column } from "react-data-grid";
import { Parser as FormulaParser } from "hot-formula-parser";
import "@/styles/forecast-grid.css";

export interface GridRow {
  id: string;
  [key: string]: string | number;
}

interface Props {
  initialRows: GridRow[];
  readOnly?: boolean;
}

const parser = new FormulaParser();

const ForecastGrid: React.FC<Props> = ({ initialRows, readOnly }) => {
  const [rows, setRows] = useState<GridRow[]>(initialRows);

  const columns: Column<GridRow>[] = useMemo(() => {
    if (rows.length === 0) return [];
    return Object.keys(rows[0]).map((key) => ({
      key,
      name: key.toUpperCase(),
      editable: !readOnly && key !== "id",
      width: 120,
    }));
  }, [rows, readOnly]);

  const evalCell = useCallback(
    (expr: string, rowIndex: number, colKey: string) => {
      if (!expr.startsWith("="))
        return isNaN(Number(expr)) ? expr : Number(expr);

      parser.on("callCellValue", ({ row, col }, done) => {
        const r = rows[row.index - 1];
        done(r ? (r[col.key] ?? 0) : 0);
      });

      const { result, error } = parser.parse(expr.slice(1), {
        row: rowIndex + 1,
        col: {
          key: colKey,
          index: columns.findIndex((c) => c.key === colKey) + 1,
        },
      });

      return error ? "#ERR" : result;
    },
    [rows, columns],
  );

  const onRowsChange = (newRows: GridRow[]) => setRows(newRows);

  return (
    <DataGrid
      columns={columns}
      rows={rows.map((r, idx) => {
        const out: GridRow = { ...r };
        columns.forEach((c) => {
          if (typeof r[c.key] === "string") {
            out[c.key] = evalCell(r[c.key] as string, idx, c.key);
          }
        });
        return out;
      })}
      onRowsChange={onRowsChange}
      className="rdg-light"
    />
  );
};

export default ForecastGrid;
