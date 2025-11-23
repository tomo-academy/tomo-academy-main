import { Button } from "@/components/ui/button";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  exportAllCardsAsPNG,
  exportAllCardsAsPDF,
  exportIndividualPDFs,
  type Employee,
} from "@/utils/exportIdCards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportIdCardsButtonProps {
  employees: Employee[];
}

export function ExportIdCardsButton({ employees }: ExportIdCardsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPNG = async () => {
    setIsExporting(true);
    toast.loading("Exporting ID cards as PNG...", { id: "export-png" });
    
    try {
      await exportAllCardsAsPNG(employees);
      toast.success(`Exported ${employees.length * 2} PNG files (front & back)`, {
        id: "export-png",
      });
    } catch (error) {
      toast.error("Failed to export PNG files", { id: "export-png" });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCombinedPDF = async () => {
    setIsExporting(true);
    toast.loading("Creating combined PDF...", { id: "export-pdf" });
    
    try {
      await exportAllCardsAsPDF(employees);
      toast.success("Exported all ID cards in one PDF", { id: "export-pdf" });
    } catch (error) {
      toast.error("Failed to export PDF", { id: "export-pdf" });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportIndividualPDFs = async () => {
    setIsExporting(true);
    toast.loading("Creating individual PDFs...", { id: "export-individual" });
    
    try {
      await exportIndividualPDFs(employees);
      toast.success(`Exported ${employees.length} individual PDF files`, {
        id: "export-individual",
      });
    } catch (error) {
      toast.error("Failed to export individual PDFs", {
        id: "export-individual",
      });
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  if (employees.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export ID Cards
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export for Printing</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleExportPNG} disabled={isExporting}>
          <FileImage className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>PNG Files</span>
            <span className="text-xs text-muted-foreground">
              Front & back for each member
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportCombinedPDF}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Combined PDF</span>
            <span className="text-xs text-muted-foreground">
              All cards in one file
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportIndividualPDFs}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          <div className="flex flex-col">
            <span>Individual PDFs</span>
            <span className="text-xs text-muted-foreground">
              Separate PDF per member
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
