import pptxgen from "pptxgenjs";
import { jsPDF } from "jspdf";

interface ExportData {
  appName: string;
  content: string;
  themeColor?: string;
}

export const exportToPPT = (data: ExportData) => {
  const pres = new pptxgen();
  const themeColor = data.themeColor || "#2563eb";
  const safeThemeColor = themeColor.startsWith('#') ? themeColor.substring(1) : themeColor;
  
  // Title Slide
  const slide1 = pres.addSlide();
  slide1.background = { fill: "F8FAFC" };
  
  // Decorative element
  slide1.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: safeThemeColor } });

  slide1.addText(data.appName, { 
    x: 0.5, y: 1.5, w: 9, h: 2, 
    fontSize: 48, color: "0F172A", bold: true, align: "center",
    fontFace: "Arial"
  });
  
  slide1.addText("Product Documentation & Strategy", { 
    x: 0.5, y: 3.2, w: 9, h: 1, 
    fontSize: 24, color: "64748B", align: "center",
    italic: true
  });

  slide1.addText(`Generated on ${new Date().toLocaleDateString()}`, { 
    x: 0.5, y: 4.5, w: 9, h: 0.5, 
    fontSize: 12, color: "94A3B8", align: "center"
  });

  // Process Content
  let sections: { title: string; body: string }[] = [];
  try {
    const parsed = JSON.parse(data.content);
    if (typeof parsed === 'object' && parsed !== null) {
      sections = Object.entries(parsed).map(([title, body]) => ({
        title,
        body: String(body)
      }));
    }
  } catch (e) {
    const rawSections = data.content.split(/\n## |^## /);
    sections = rawSections
      .filter(s => s.trim())
      .map(section => {
        const lines = section.split('\n');
        const title = lines[0].trim().replace(/^#+\s+/, '');
        const body = lines.slice(1).join('\n').trim();
        return { title, body };
      });
  }

  // Content Slides
  sections.forEach((section) => {
    const maxCharsPerSlide = 1200;
    const bodyText = section.body;
    
    // Split body into chunks if too long for one slide
    const chunks = [];
    if (bodyText.length > maxCharsPerSlide) {
      for (let i = 0; i < bodyText.length; i += maxCharsPerSlide) {
        chunks.push(bodyText.substring(i, i + maxCharsPerSlide));
      }
    } else {
      chunks.push(bodyText);
    }

    chunks.forEach((chunk, idx) => {
      const slide = pres.addSlide();
      slide.background = { fill: "FFFFFF" };
      
      // Header
      slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 0.2, h: '100%', fill: { color: safeThemeColor } });
      
      slide.addText(idx > 0 ? `${section.title} (cont.)` : section.title, { 
        x: 0.5, y: 0.3, w: 9, h: 0.8,
        fontSize: 28, color: safeThemeColor, bold: true,
        valign: "middle"
      });

      slide.addText(chunk, { 
        x: 0.5, y: 1.2, w: 9, h: 4.2, 
        fontSize: 16, color: "334155", 
        align: "left", valign: "top",
        lineSpacing: 24
      });
      
      slide.addText(`${data.appName} | Page ${idx + 1}`, { 
        x: 0.5, y: 5.4, w: 9, h: 0.3, 
        fontSize: 10, color: "CBD5E1", align: "right"
      });
    });
  });

  pres.writeFile({ fileName: `${data.appName.replace(/\s+/g, '_')}_Presentation.pptx` });
};

export const exportToPDF = (data: ExportData) => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4'
  });
  
  const themeColor = data.themeColor || "#2563eb";
  const rgb = hexToRgb(themeColor) || { r: 37, g: 99, b: 235 };

  // Cover Page
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Sidebar accent
  doc.setFillColor(rgb.r, rgb.g, rgb.b);
  doc.rect(0, 0, 15, 297, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(44);
  const titleLines = doc.splitTextToSize(data.appName, 160);
  doc.text(titleLines, 30, 80);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(20);
  doc.setFont("helvetica", "normal");
  doc.text("Project Documentation & Strategy", 30, 110);

  doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  doc.setLineWidth(2);
  doc.line(30, 120, 100, 120);

  doc.setFontSize(12);
  doc.text(`Created: ${new Date().toLocaleDateString()}`, 30, 250);

  // Process Content
  let sections: { title: string; body: string }[] = [];
  try {
    const parsed = JSON.parse(data.content);
    if (typeof parsed === 'object' && parsed !== null) {
      sections = Object.entries(parsed).map(([title, body]) => ({
        title,
        body: String(body)
      }));
    }
  } catch (e) {
    const rawSections = data.content.split(/\n## |^## /);
    sections = rawSections
      .filter(s => s.trim())
      .map(section => {
        const lines = section.split('\n');
        const title = lines[0].trim().replace(/^#+\s+/, '');
        const body = lines.slice(1).join('\n').trim();
        return { title, body };
      });
  }

  const margin = 25;
  const pageWidth = 210;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  sections.forEach((section) => {
    doc.addPage();
    y = 30;

    // Header bar
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.05);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(data.appName.toUpperCase(), margin, 15);

    // Section Title
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(section.title, margin, y);
    y += 15;

    // Section Body
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    
    const bodyLines = doc.splitTextToSize(section.body, contentWidth);
    
    bodyLines.forEach((line: string) => {
      if (y > 270) {
        doc.addPage();
        y = 30;
      }
      doc.text(line, margin, y);
      y += 6;
    });
  });

  doc.save(`${data.appName.replace(/\s+/g, '_')}_Docs.pdf`);
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}
