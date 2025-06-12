
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExportService, ExportData } from '@/services/ExportService';
import { Download, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonsProps {
  data: ExportData;
  elementId?: string;
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data, elementId }) => {
  const { toast } = useToast();

  const handleCSVExport = () => {
    try {
      ExportService.exportToCSV(data);
      toast({
        title: "Export Successful",
        description: "CSV file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV file",
        variant: "destructive",
      });
    }
  };

  const handlePDFExport = async () => {
    if (!elementId) {
      toast({
        title: "Export Failed",
        description: "No element specified for PDF export",
        variant: "destructive",
      });
      return;
    }

    try {
      await ExportService.exportToPDF(elementId, data);
      toast({
        title: "Export Successful",
        description: "PDF file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF file",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleCSVExport} className="flex items-center gap-2">
        <Download className="w-4 h-4" />
        Export CSV
      </Button>
      {elementId && (
        <Button variant="outline" onClick={handlePDFExport} className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Export PDF
        </Button>
      )}
    </div>
  );
};
