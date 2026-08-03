import { jsPDF } from 'jspdf';
try {
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] });
  console.log("Success:", pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
} catch(e) {
  console.error("Error:", e);
}
