import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { ExportableIDCard } from '@/components/ui/exportable-id-card';

export interface Employee {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  location: string;
  photo?: string;
  [key: string]: any;
}

// Helper to render a React component and capture it
const renderAndCapture = async (
  employee: Employee,
  side: 'front' | 'back'
): Promise<HTMLCanvasElement> => {
  // Create a temporary container
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '320px';
  container.style.height = '200px';
  document.body.appendChild(container);

  // Render the React component
  const root = createRoot(container);
  const cardElement = createElement(ExportableIDCard, { employee, side });
  
  await new Promise<void>((resolve) => {
    root.render(cardElement);
    // Wait for render to complete
    setTimeout(resolve, 100);
  });

  // Capture the rendered component
  const canvas = await html2canvas(container, {
    scale: 3,
    backgroundColor: '#ffffff',
    logging: false,
    useCORS: true,
    width: 320,
    height: 200,
  });

  // Clean up
  root.unmount();
  document.body.removeChild(container);

  return canvas;
};

export const exportSingleCardAsPNG = async (
  employee: Employee,
  fileName: string,
  side: 'front' | 'back'
): Promise<void> => {
  try {
    const canvas = await renderAndCapture(employee, side);

    const link = document.createElement('a');
    link.download = `${fileName}_${side}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting card as PNG:', error);
    throw error;
  }
};

export const exportSingleCardAsPDF = async (
  employee: Employee,
  fileName: string
): Promise<void> => {
  try {
    // Capture both sides
    const frontCanvas = await renderAndCapture(employee, 'front');
    const backCanvas = await renderAndCapture(employee, 'back');

    // Create PDF (credit card size: 85.6mm x 53.98mm)
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    // Add front side
    const frontImgData = frontCanvas.toDataURL('image/png');
    pdf.addImage(frontImgData, 'PNG', 0, 0, 85.6, 53.98);

    // Add back side on new page
    pdf.addPage();
    const backImgData = backCanvas.toDataURL('image/png');
    pdf.addImage(backImgData, 'PNG', 0, 0, 85.6, 53.98);

    // Save PDF
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error('Error exporting card as PDF:', error);
    throw error;
  }
};

export const exportAllCardsAsPNG = async (employees: Employee[]): Promise<void> => {
  try {
    for (const employee of employees) {
      const fileName = `${employee.name.replace(/\s+/g, '_')}_${employee.employeeId}`;
      
      // Export front
      await exportSingleCardAsPNG(employee, fileName, 'front');
      
      // Small delay to prevent overwhelming the browser
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Export back
      await exportSingleCardAsPNG(employee, fileName, 'back');
      
      // Small delay between employees
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  } catch (error) {
    console.error('Error exporting all cards as PNG:', error);
    throw error;
  }
};

export const exportAllCardsAsPDF = async (employees: Employee[]): Promise<void> => {
  try {
    // Create a single PDF with all cards
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [85.6, 53.98],
    });

    let firstPage = true;

    for (const employee of employees) {
      // Capture both sides
      const frontCanvas = await renderAndCapture(employee, 'front');
      const backCanvas = await renderAndCapture(employee, 'back');

      // Add front side
      if (!firstPage) {
        pdf.addPage();
      }
      firstPage = false;

      const frontImgData = frontCanvas.toDataURL('image/png');
      pdf.addImage(frontImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Add back side
      pdf.addPage();
      const backImgData = backCanvas.toDataURL('image/png');
      pdf.addImage(backImgData, 'PNG', 0, 0, 85.6, 53.98);

      // Small delay between employees
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Save the combined PDF
    pdf.save(`TOMO_Academy_All_ID_Cards.pdf`);
  } catch (error) {
    console.error('Error exporting all cards as PDF:', error);
    throw error;
  }
};

export const exportIndividualPDFs = async (employees: Employee[]): Promise<void> => {
  try {
    for (const employee of employees) {
      const fileName = `${employee.name.replace(/\s+/g, '_')}_${employee.employeeId}`;
      await exportSingleCardAsPDF(employee, fileName);
      
      // Small delay between employees
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error('Error exporting individual PDFs:', error);
    throw error;
  }
};
