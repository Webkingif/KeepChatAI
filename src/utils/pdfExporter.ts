import { jsPDF } from 'jspdf';
import { toCanvas } from 'html-to-image';
import { ChatThread, SavedOutput } from '../types/keepchat';
import { formatFullDateTime } from './date';

export interface PdfExportOptions {
  filename?: string;
  chatTitle?: string;
  orientation?: 'p' | 'l';
  customWidthPx?: number;
}

/**
 * Calculates uniform dimensions [pageWidthMm, pageHeightMm]
 * guaranteed to apply consistently to all pages of the document.
 */
function getUniformPageDimensions(
  orientation: 'p' | 'l',
  customWidthPx?: number
): [number, number] {
  let pageWidth: number;
  let pageHeight: number;

  if (orientation === 'l') {
    // Landscape: standard A4 is 297mm x 210mm
    if (customWidthPx && customWidthPx > 1050) {
      pageWidth = Math.round((customWidthPx / 1050) * 297);
      pageHeight = Math.round(pageWidth / 1.4142);
    } else {
      pageWidth = 297;
      pageHeight = 210;
    }
  } else {
    // Portrait: standard A4 is 210mm x 297mm
    if (customWidthPx && customWidthPx > 750) {
      pageWidth = Math.round((customWidthPx / 750) * 210);
      pageHeight = Math.round(pageWidth * 1.4142);
    } else {
      pageWidth = 210;
      pageHeight = 297;
    }
  }

  return [pageWidth, pageHeight];
}

/**
 * Generates a clean, 100% SELECTABLE & HIGHLIGHTABLE vector text PDF document.
 * Code blocks are styled with a monospace courier font inside light-gray background boxes.
 * Text can be selected with the cursor, copied (Ctrl+C), and searched.
 */
export async function exportStructuredPdf(
  chat: ChatThread,
  outputs: SavedOutput[],
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    orientation = 'p',
    customWidthPx,
    filename = `${chat.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`,
  } = options;

  const sortedOutputs = [...outputs].sort((a, b) => a.createdAt - b.createdAt);
  const [pageWidth, pageHeight] = getUniformPageDimensions(orientation, customWidthPx);
  const format: [number, number] = [pageWidth, pageHeight];

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const marginX = 14;
  const marginTop = 14;
  const marginBottom = 16;
  const printableWidth = pageWidth - marginX * 2;
  let currentY = marginTop;

  // Helper to ensure uniform page addition
  const checkNewPage = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - marginBottom) {
      doc.addPage(format, orientation);
      currentY = marginTop;
      return true;
    }
    return false;
  };

  // 1. Formal Document Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(chat.title, marginX, currentY);
  currentY += 7;

  if (chat.description) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139); // slate-500
    const descLines = doc.splitTextToSize(chat.description, printableWidth);
    doc.text(descLines, marginX, currentY);
    currentY += descLines.length * 4.5 + 2;
  }

  // Document metadata bar
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    `Category: ${chat.category}  •  Outputs: ${sortedOutputs.length}  •  Exported on ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`,
    marginX,
    currentY
  );
  currentY += 4;

  // Subtle separator line
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY, marginX + printableWidth, currentY);
  currentY += 8;

  // 2. Continuous Flow of Outputs
  sortedOutputs.forEach((output, idx) => {
    checkNewPage(24);

    // Output index & Model header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(0, 128, 105); // KeepChat teal
    doc.text(`OUTPUT #${idx + 1}  •  ${output.aiModel.toUpperCase()}`, marginX, currentY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(formatFullDateTime(output.createdAt), pageWidth - marginX, currentY, {
      align: 'right',
    });
    currentY += 5;

    // Output Title (if available)
    if (output.title) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(15, 23, 42);
      const titleLines = doc.splitTextToSize(output.title, printableWidth);
      checkNewPage(titleLines.length * 6);
      doc.text(titleLines, marginX, currentY);
      currentY += titleLines.length * 6 + 2;
    }

    // User prompt (if available)
    if (output.userPrompt) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const promptLines = doc.splitTextToSize(`Prompt: "${output.userPrompt}"`, printableWidth - 8);
      const boxHeight = promptLines.length * 4.5 + 4;

      checkNewPage(boxHeight + 2);
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(marginX, currentY - 2, printableWidth, boxHeight, 'F');
      doc.setDrawColor(0, 128, 105);
      doc.setLineWidth(0.8);
      doc.line(marginX, currentY - 2, marginX, currentY - 2 + boxHeight);

      doc.text(promptLines, marginX + 4, currentY + 2);
      currentY += boxHeight + 4;
    }

    // 3. Body Content Parser (Markdown, Paragraphs & Monospace Code Blocks)
    const content = output.content;
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Text before code block
      const textBefore = content.substring(lastIndex, match.index).trim();
      if (textBefore) {
        renderTextBlock(doc, textBefore, marginX, printableWidth, () => checkNewPage(8), (y) => {
          currentY = y;
        }, currentY);
      }

      // Code Block with Monospace courier font in light-gray box
      const language = match[1] || 'code';
      const codeText = match[2].trimEnd();
      const rawLines = codeText.split('\n');

      // Estimate height
      const lineHeightMm = 3.6;
      const codeBoxPadding = 4;
      const headerHeight = 5;

      checkNewPage(16);

      // Language label
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(language.toUpperCase(), marginX + 3, currentY);
      currentY += 2;

      // Render lines of code inside gray box
      rawLines.forEach((line) => {
        // Wrap very long lines if necessary while keeping indentation
        const wrappedCodeLines = doc.splitTextToSize(line, printableWidth - 8);
        const chunkHeight = wrappedCodeLines.length * lineHeightMm;

        checkNewPage(chunkHeight + 2);

        // Light gray background box
        doc.setFillColor(243, 244, 246); // #f3f4f6
        doc.rect(marginX, currentY - 2.5, printableWidth, chunkHeight + 1, 'F');

        doc.setFont('courier', 'normal');
        doc.setFontSize(8.5);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text(wrappedCodeLines, marginX + 4, currentY);

        currentY += chunkHeight;
      });

      currentY += 4;
      lastIndex = match.index + match[0].length;
    }

    // Remaining text after last code block
    const remainingText = content.substring(lastIndex).trim();
    if (remainingText) {
      renderTextBlock(doc, remainingText, marginX, printableWidth, () => checkNewPage(8), (y) => {
        currentY = y;
      }, currentY);
    }

    // Tags
    if (output.tags && output.tags.length > 0) {
      checkNewPage(8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 128, 105);
      const tagString = output.tags.map((t) => (t.startsWith('#') ? t : `#${t}`)).join('  ');
      doc.text(`Tags: ${tagString}`, marginX, currentY);
      currentY += 5;
    }

    // Divider between continuous outputs
    if (idx < sortedOutputs.length - 1) {
      checkNewPage(10);
      currentY += 3;
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.3);
      doc.line(marginX, currentY, marginX + printableWidth, currentY);
      currentY += 7;
    }
  });

  // 4. Uniform Running Page Numbers & Footers on Every Page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`KeepChat · ${chat.title}`, marginX, pageHeight - 6);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 6, {
      align: 'right',
    });
  }

  doc.save(filename);
}

/**
 * Helper to render normal Markdown text paragraphs, lists, and headings as vector text
 */
function renderTextBlock(
  doc: jsPDF,
  text: string,
  marginX: number,
  printableWidth: number,
  onCheckPage: () => void,
  setY: (y: number) => void,
  startY: number
) {
  let y = startY;
  const paragraphs = text.split('\n\n');

  paragraphs.forEach((p) => {
    const trimmed = p.trim();
    if (!trimmed) return;

    if (trimmed.startsWith('### ')) {
      onCheckPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
      const lines = doc.splitTextToSize(trimmed.replace(/^###\s+/, ''), printableWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 5 + 2;
    } else if (trimmed.startsWith('## ')) {
      onCheckPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(trimmed.replace(/^##\s+/, ''), printableWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 5.5 + 2;
    } else if (trimmed.startsWith('# ')) {
      onCheckPage();
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      const lines = doc.splitTextToSize(trimmed.replace(/^#\s+/, ''), printableWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 6 + 3;
    } else {
      // Clean paragraph / list items
      const lines = trimmed.split('\n');
      lines.forEach((line) => {
        onCheckPage();
        const isBullet = line.startsWith('- ') || line.startsWith('* ');
        const cleanLine = isBullet ? `•  ${line.substring(2)}` : line;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
        const wrapped = doc.splitTextToSize(cleanLine, printableWidth);
        doc.text(wrapped, marginX + (isBullet ? 2 : 0), y);
        y += wrapped.length * 4.5 + 1;
      });
      y += 2;
    }
  });

  setY(y);
}

/**
 * Converts an HTML element into a multi-page snapshot PDF document
 * where every page has strictly identical width and height.
 */
export async function exportElementAsPdf(
  element: HTMLElement,
  options: PdfExportOptions = {}
): Promise<void> {
  const {
    filename = `keepchat-export-${new Date().toISOString().slice(0, 10)}.pdf`,
    chatTitle = 'KeepChat Document',
    orientation = 'p',
    customWidthPx,
  } = options;

  // Convert element to a high-resolution canvas (2x pixel density)
  const canvas = await toCanvas(element, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const [pageWidth, pageHeight] = getUniformPageDimensions(orientation, customWidthPx);
  const format: [number, number] = [pageWidth, pageHeight];

  // Initialize jsPDF with explicit uniform dimensions for page 1
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format,
  });

  const marginX = 14;
  const marginTop = 12;
  const marginBottom = 14;
  const printableWidth = pageWidth - marginX * 2;
  const printableHeight = pageHeight - marginTop - marginBottom;

  const pxPerMm = canvas.width / printableWidth;
  const pageHeightPx = Math.floor(printableHeight * pxPerMm);

  const totalHeightPx = canvas.height;
  const totalPages = Math.ceil(totalHeightPx / pageHeightPx) || 1;

  for (let page = 0; page < totalPages; page++) {
    if (page > 0) {
      // Guarantee identical width, height, and orientation on all subsequent pages
      pdf.addPage(format, orientation);
    }

    const sourceY = page * pageHeightPx;
    const sliceHeightPx = Math.min(pageHeightPx, totalHeightPx - sourceY);

    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = sliceHeightPx;
    const sliceCtx = sliceCanvas.getContext('2d');

    if (sliceCtx) {
      sliceCtx.fillStyle = '#ffffff';
      sliceCtx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
      sliceCtx.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeightPx,
        0,
        0,
        canvas.width,
        sliceHeightPx
      );

      const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.95);
      const sliceHeightMm = sliceHeightPx / pxPerMm;

      pdf.addImage(
        sliceData,
        'JPEG',
        marginX,
        marginTop,
        printableWidth,
        sliceHeightMm,
        undefined,
        'FAST'
      );
    }

    // Professional Footer with Running Page Count and Branding
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(140, 150, 160);
    pdf.text(
      `KeepChat · ${chatTitle}`,
      marginX,
      pageHeight - 6
    );
    pdf.text(
      `Page ${page + 1} of ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 6,
      { align: 'right' }
    );
  }

  pdf.save(filename);
}
