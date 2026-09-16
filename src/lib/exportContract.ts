import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";

const captureCanvas = async (node: HTMLElement) => {
  // The node carries a CSS scale() transform to fit whatever container it's
  // displayed in (see LetterheadCanvas) - remove it while capturing so the
  // export is always full-resolution at the canvas's native design size.
  const originalTransform = node.style.transform;
  node.style.transform = "none";
  try {
    return await html2canvas(node, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
  } finally {
    node.style.transform = originalTransform;
  }
};

const downloadDataUrl = (dataUrl: string, filename: string) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportNodeAsPng = async (node: HTMLElement, filename: string) => {
  const canvas = await captureCanvas(node);
  downloadDataUrl(canvas.toDataURL("image/png"), filename);
};

export const exportNodeAsPdf = async (node: HTMLElement, filename: string) => {
  await exportNodesAsPdf([node], filename);
};

// Multi-page contracts: each node becomes its own A4 page in one PDF.
export const exportNodesAsPdf = async (nodes: HTMLElement[], filename: string) => {
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < nodes.length; i++) {
    const canvas = await captureCanvas(nodes[i]);
    const imgData = canvas.toDataURL("image/png");
    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  pdf.save(filename);
};

// Multi-page contracts: downloads one PNG per page, numbered in the filename.
export const exportNodesAsPng = async (nodes: HTMLElement[], filenameBase: string) => {
  for (let i = 0; i < nodes.length; i++) {
    const canvas = await captureCanvas(nodes[i]);
    const suffix = nodes.length > 1 ? `-page-${i + 1}` : "";
    downloadDataUrl(canvas.toDataURL("image/png"), filenameBase.replace(/\.png$/, `${suffix}.png`));
  }
};
