import * as FileSystem from "expo-file-system";

export interface PdfInfo {
  pageCount: number;
  fileSize: number;
}

export const getPdfInfo = async (pdfPath: string): Promise<PdfInfo | null> => {
  try {
    console.log("Getting PDF info for:", pdfPath);

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(pdfPath);
    console.log("File info:", fileInfo);

    if (!fileInfo.exists) {
      throw new Error("PDF file not found");
    }

    const fileSize = fileInfo.size || 0;
    console.log("File size:", fileSize, "bytes");

    // More accurate estimation based on file size
    // Different types of PDFs have different page sizes
    let estimatedPages: number;

    if (fileSize < 50000) {
      // < 50KB - likely 1-3 pages
      estimatedPages = Math.max(1, Math.round(fileSize / 15000));
    } else if (fileSize < 200000) {
      // 50KB - 200KB - likely 3-10 pages
      estimatedPages = Math.max(3, Math.round(fileSize / 20000));
    } else if (fileSize < 500000) {
      // 200KB - 500KB - likely 10-25 pages
      estimatedPages = Math.max(10, Math.round(fileSize / 25000));
    } else if (fileSize < 1000000) {
      // 500KB - 1MB - likely 25-50 pages
      estimatedPages = Math.max(25, Math.round(fileSize / 30000));
    } else if (fileSize < 5000000) {
      // 1MB - 5MB - likely 50-200 pages
      estimatedPages = Math.max(50, Math.round(fileSize / 35000));
    } else {
      // > 5MB - likely 200+ pages
      estimatedPages = Math.max(200, Math.round(fileSize / 40000));
    }

    console.log("Estimated pages:", estimatedPages);

    return {
      pageCount: estimatedPages,
      fileSize: fileSize,
    };
  } catch (error) {
    console.error("Error getting PDF info:", error);
    return null;
  }
};

// Alternative method using PDF.js (if available)
export const getPdfPageCount = async (
  pdfPath: string
): Promise<number | null> => {
  try {
    // This would require a native module or PDF.js implementation
    // For now, we'll use the estimation method above
    const pdfInfo = await getPdfInfo(pdfPath);
    return pdfInfo?.pageCount || null;
  } catch (error) {
    console.error("Error getting PDF page count:", error);
    return null;
  }
};
