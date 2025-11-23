import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface Employee {
  id: string;
  name: string;
  role: string;
  employeeId: string;
  location: string;
  [key: string]: any;
}

export const exportSingleCardAsPNG = async (
  cardElement: HTMLElement,
  fileName: string,
  side: 'front' | 'back'
): Promise<void> => {
  try {
    const canvas = await html2canvas(cardElement, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

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
  frontElement: HTMLElement,
  backElement: HTMLElement,
  fileName: string
): Promise<void> => {
  try {
    // Capture both sides
    const frontCanvas = await html2canvas(frontElement, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

    const backCanvas = await html2canvas(backElement, {
      scale: 3,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
    });

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
      const frontCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="front"]`) as HTMLElement;
      const backCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="back"]`) as HTMLElement;

      if (frontCard && backCard) {
        const fileName = `${employee.name.replace(/\s+/g, '_')}_${employee.employeeId}`;
        
        // Export front
        await exportSingleCardAsPNG(frontCard, fileName, 'front');
        
        // Small delay to prevent overwhelming the browser
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Export back
        await exportSingleCardAsPNG(backCard, fileName, 'back');
        
        // Small delay between employees
        await new Promise(resolve => setTimeout(resolve, 200));
      }
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
      const frontCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="front"]`) as HTMLElement;
      const backCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="back"]`) as HTMLElement;

      if (frontCard && backCard) {
        // Capture both sides
        const frontCanvas = await html2canvas(frontCard, {
          scale: 3,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
        });

        const backCanvas = await html2canvas(backCard, {
          scale: 3,
          backgroundColor: '#ffffff',
          logging: false,
          useCORS: true,
        });

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
      const frontCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="front"]`) as HTMLElement;
      const backCard = document.querySelector(`[data-card-id="${employee.id}"][data-side="back"]`) as HTMLElement;

      if (frontCard && backCard) {
        const fileName = `${employee.name.replace(/\s+/g, '_')}_${employee.employeeId}`;
        await exportSingleCardAsPDF(frontCard, backCard, fileName);
        
        // Small delay between employees
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
  } catch (error) {
    console.error('Error exporting individual PDFs:', error);
    throw error;
  }
};
