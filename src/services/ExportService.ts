
import Papa from 'papaparse';
import html2pdf from 'html2pdf.js';
import { WealthProjection, IncomeSource, ExpenseCategory, EquityPayout, RealEstateProperty } from '@/pages/Index';

export interface ExportData {
  incomes: IncomeSource[];
  expenses: ExpenseCategory[];
  equityPayouts: EquityPayout[];
  properties: RealEstateProperty[];
  projections: WealthProjection[];
  scenarioName?: string;
}

export class ExportService {
  static exportToCSV(data: ExportData, filename?: string) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const csvFilename = filename || `wealth-forecast-${timestamp}.csv`;
    
    // Prepare data for CSV
    const csvData = data.projections.map(projection => ({
      Year: projection.year,
      'Gross Income': projection.grossIncome,
      'Net Income': projection.netIncome,
      'Total Expenses': projection.totalExpenses,
      'Annual Savings': projection.savings,
      'Cumulative Wealth': projection.cumulativeWealth,
      'Taxes Paid': projection.taxes,
      'Real Estate Value': projection.realEstateValue,
      'Real Estate Equity': projection.realEateEquity,
      'Loan Balance': projection.loanBalance
    }));
    
    // Add summary section
    const summaryData = [
      { Category: 'Income Sources', Count: data.incomes.length },
      { Category: 'Expense Categories', Count: data.expenses.length },
      { Category: 'Equity Payouts', Count: data.equityPayouts.length },
      { Category: 'Properties', Count: data.properties.length },
      { Category: 'Scenario', Name: data.scenarioName || 'Default' }
    ];
    
    const csv = Papa.unparse({
      fields: Object.keys(csvData[0] || {}),
      data: csvData
    });
    
    const summaryCSV = Papa.unparse({
      fields: ['Category', 'Count', 'Name'],
      data: summaryData
    });
    
    const finalCSV = `Wealth Forecast Export - ${new Date().toLocaleDateString()}\n\n` +
                    `Summary:\n${summaryCSV}\n\n` +
                    `Projections:\n${csv}`;
    
    this.downloadFile(finalCSV, csvFilename, 'text/csv');
  }
  
  static async exportToPDF(elementId: string, data: ExportData, filename?: string) {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const pdfFilename = filename || `wealth-forecast-${timestamp}.pdf`;
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('Element not found for PDF export');
    }
    
    const options = {
      margin: 1,
      filename: pdfFilename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    try {
      await html2pdf().set(options).from(element).save();
    } catch (error) {
      console.error('PDF export failed:', error);
      throw error;
    }
  }
  
  private static downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
