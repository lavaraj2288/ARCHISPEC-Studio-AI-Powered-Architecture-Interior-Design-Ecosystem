import { MaterialItem, BOQSummary, UserRole } from '../types';
import { formatINR } from './boqCalculations';

export function exportBOQToCSV(
  materials: MaterialItem[],
  summary: BOQSummary,
  currentRole: UserRole,
  projectName: string = 'Archispec_Studio_Project'
) {
  const isArchitect = currentRole === 'architect';

  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Header row
  if (isArchitect) {
    csvContent += 'Item ID,Material Name,Category,Room,Brand,Specifications,Unit,Qty,Material Rate (INR),Labor Rate (INR),Line Total (INR),Status,Vendor Code\n';
  } else {
    csvContent += 'Item ID,Material Name,Category,Room,Brand,Specifications,Unit,Qty,Unit Rate (INR),Line Total (INR),Status\n';
  }

  materials.forEach(item => {
    const totalLine = (item.rate + item.laborRatePerUnit) * item.quantity;
    const cleanSpec = `"${item.specs.replace(/"/g, '""')}"`;
    const cleanBrand = `"${item.brand.replace(/"/g, '""')}"`;
    const cleanName = `"${item.name.replace(/"/g, '""')}"`;

    if (isArchitect) {
      csvContent += `${item.id},${cleanName},${item.category},${item.room},${cleanBrand},${cleanSpec},${item.unit},${item.quantity},${item.rate},${item.laborRatePerUnit},${totalLine},${item.status},${item.vendorCode}\n`;
    } else {
      csvContent += `${item.id},${cleanName},${item.category},${item.room},${cleanBrand},${cleanSpec},${item.unit},${item.quantity},${item.rate + item.laborRatePerUnit},${totalLine},${item.status}\n`;
    }
  });

  csvContent += '\nSUMMARY ESTIMATE\n';
  csvContent += `Material Subtotal,${summary.materialSubtotal}\n`;
  csvContent += `Labor Subtotal,${summary.laborSubtotal}\n`;
  csvContent += `Base Works Cost,${summary.baseCost}\n`;
  csvContent += `GST (18%),${summary.gstAmount}\n`;

  if (isArchitect) {
    csvContent += `Architect Agency Margin (15%),${summary.architectMarginAmount}\n`;
  }

  csvContent += `Grand Total Client Estimate,${summary.finalClientTotal}\n`;

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${projectName}_BOQ_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
