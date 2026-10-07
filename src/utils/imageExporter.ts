import { toPng } from 'html-to-image';

export interface ImageExportOptions {
  filename?: string;
  pixelRatio?: number;
  backgroundColor?: string;
}

/**
 * Captures an HTML element and triggers a direct browser PNG download.
 */
export async function exportElementAsPng(
  element: HTMLElement,
  options: ImageExportOptions = {}
): Promise<string> {
  const {
    filename = `keepchat-export-${new Date().toISOString().slice(0, 10)}.png`,
    pixelRatio = 2,
    backgroundColor,
  } = options;

  try {
    const dataUrl = await toPng(element, {
      pixelRatio,
      cacheBust: true,
      backgroundColor,
      filter: (node: HTMLElement) => {
        // Exclude elements marked with data-export-ignore (e.g. action buttons, menus)
        if (node.classList && node.classList.contains('export-ignore')) {
          return false;
        }
        return true;
      },
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
    }, 1000);

    return dataUrl;
  } catch (error) {
    console.error('Failed to export element as image:', error);
    throw error;
  }
}
