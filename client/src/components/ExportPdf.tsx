import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from './ui/button';
import { Activity } from 'lucide-react';

interface ExportToPDFProps<T extends object> {
  data: T[];
  fileName: string;
}
function ExportToPDF<T extends object>({
  data,
  fileName,
}: ExportToPDFProps<T>) {
  const handleExport = () => {
    const doc = new jsPDF();

    const tableColumn = Object.keys(data[0]) as (keyof T)[];

    const tableRows = data.map((item) =>
      tableColumn.map((key) => String(item[key])),
    );

    autoTable(doc, {
      head: [tableColumn.map(String)],
      body: tableRows,
    });

    doc.save(`${fileName}.pdf`);
  };

  return (
    <Button onClick={handleExport} variant="secondary">
      <Activity className="mr-2 h-4 w-4" />
      Export to PDF
    </Button>
  );
}

export { ExportToPDF };
