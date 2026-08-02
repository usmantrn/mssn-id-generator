import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { PortraitCard, LandscapeCard } from '../components/idcard/IDCardTemplate';

export async function generateAndDownloadPdf(member) {
  return new Promise((resolve, reject) => {
    try {
      const isOfficial = member.role === 'official';
      
      const container = document.createElement('div');
      // Hide container off-screen
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '-9999px';
      document.body.appendChild(container);

      const root = createRoot(container);
      const frontRef = React.createRef();
      const backRef = React.createRef();

      const assets = {
        mssnLogo: '/card-assets/mssn-logo.jpeg',
        futbLogo: '/card-assets/futb-logo.jpeg',
        amirSig: '/card-assets/amir-sig.png'
      };

      const CardComponent = isOfficial ? LandscapeCard : PortraitCard;

      root.render(
        <CardComponent member={member} assets={assets} frontRef={frontRef} backRef={backRef} />
      );

      // Wait a moment for images to load (especially the cross-origin photo)
      setTimeout(async () => {
        try {
          if (!frontRef.current || !backRef.current) throw new Error("Card refs not attached");
          
          const pdf = isOfficial
            ? new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85.6, 54] })
            : new jsPDF({ orientation: 'portrait', unit: 'mm', format: [54, 85.6] });

          // Front side
          const frontCanvas = await html2canvas(frontRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
          });
          const frontImg = frontCanvas.toDataURL('image/jpeg', 1.0);
          
          if (isOfficial) {
            pdf.addImage(frontImg, 'JPEG', 0, 0, 85.6, 54);
          } else {
            pdf.addImage(frontImg, 'JPEG', 0, 0, 54, 85.6);
          }

          // Back side
          pdf.addPage();
          const backCanvas = await html2canvas(backRef.current, {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            backgroundColor: '#ffffff',
          });
          const backImg = backCanvas.toDataURL('image/jpeg', 1.0);

          if (isOfficial) {
            pdf.addImage(backImg, 'JPEG', 0, 0, 85.6, 54);
          } else {
            pdf.addImage(backImg, 'JPEG', 0, 0, 54, 85.6);
          }

          pdf.save(`MSSN_ID_${member.memberId}.pdf`);
          
          // Cleanup
          root.unmount();
          document.body.removeChild(container);
          
          resolve();
        } catch (err) {
          console.error("html2canvas error:", err);
          root.unmount();
          if (document.body.contains(container)) document.body.removeChild(container);
          reject(err);
        }
      }, 1000); // 1s delay for image loading
    } catch (err) {
      reject(err);
    }
  });
}
