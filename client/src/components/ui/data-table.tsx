import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    key: string;
    header: string;
    cell?: (item: T) => React.ReactNode;
  }[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  pageSize?: number;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  onRowClick,
  actions,
  pageSize = 10
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(pageSize);

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, data.length);
  const currentData = data.slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-neutral-50">
            <TableRow>
              {columns.map((column) => (
                <TableHead key={column.key} className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  {column.header}
                </TableHead>
              ))}
              {actions && (
                <TableHead className="px-5 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.map((item) => (
              <TableRow 
                key={item.id} 
                className={onRowClick ? "hover:bg-neutral-50 cursor-pointer" : "hover:bg-neutral-50"}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={`${item.id}-${column.key}`} className="px-5 py-4 whitespace-nowrap">
                    {column.cell ? column.cell(item) : (item as any)[column.key]}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="px-5 py-4 whitespace-nowrap">
                    {actions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))}
            {currentData.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="text-center py-6 text-neutral-500">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {data.length > 0 && (
        <div className="bg-neutral-50 px-5 py-3 flex items-center justify-between border-t border-neutral-200">
          <div className="flex items-center text-sm text-neutral-500">
            <span>Showing</span>
            <Select 
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="mx-2 border-none bg-transparent text-sm text-neutral-600 focus:outline-none focus:ring-0 h-7 w-16">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span>of {data.length} items</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-neutral-300 rounded-md bg-white text-neutral-600 text-sm hover:bg-neutral-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded-md text-sm ${
                currentPage === totalPages
                  ? "border-neutral-300 bg-white text-neutral-400"
                  : "border-primary-600 bg-primary-700 text-white hover:bg-primary-800"
              }`}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
