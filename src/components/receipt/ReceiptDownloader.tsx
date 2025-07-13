import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Share2 } from "lucide-react";
import ReceiptComponent from "./ReceiptComponent";
import { toast } from "sonner";

// Conditional imports for Workers compatibility
let toPng: any, toJpeg: any;

// Dynamic import for Workers compatibility
const loadHtmlToImage = async () => {
  if (typeof window !== "undefined" && !toPng) {
    try {
      const htmlToImage = await import("html-to-image");
      toPng = htmlToImage.toPng;
      toJpeg = htmlToImage.toJpeg;
    } catch (error) {
      console.warn("html-to-image not available:", error);
    }
  }
};

interface ReceiptDownloaderProps {
  reference: string;
  amount: number;
  timestamp?: string;
  items: Array<{
    id: string;
    title: string;
    author?: string;
    price: number;
  }>;
  buyer?: {
    name: string;
    email: string;
  };
  seller?: {
    name: string;
    email: string;
  };
  deliveryMethod?: string;
  deliveryFee?: number;
  deliveryAddress?: any;
}

const ReceiptDownloader: React.FC<ReceiptDownloaderProps> = (props) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadAsImage = async (format: "png" | "jpeg" = "png") => {
    // Ensure we're in browser environment
    if (typeof window === "undefined") {
      toast.error("Download not available in this environment");
      return;
    }

    if (!receiptRef.current) {
      toast.error("Receipt not ready for download");
      return;
    }

    // Load html-to-image library
    await loadHtmlToImage();
    if (!toPng || !toJpeg) {
      toast.error("Image generation not available");
      return;
    }

    setIsGenerating(true);
    try {
      const options = {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      };

      const dataUrl =
        format === "png"
          ? await toPng(receiptRef.current, options)
          : await toJpeg(receiptRef.current, options);

      // Create download link
      const link = document.createElement("a");
      link.download = `receipt-${props.reference}.${format}`;
      link.href = dataUrl;
      link.click();

      toast.success(`Receipt downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error generating receipt image:", error);
      toast.error("Failed to generate receipt image");
    } finally {
      setIsGenerating(false);
    }
  };

  const shareReceipt = async () => {
    if (!receiptRef.current) {
      toast.error("Receipt not ready for sharing");
      return;
    }

    try {
      setIsGenerating(true);
      const dataUrl = await toPng(receiptRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Convert data URL to blob
      let blob: Blob;
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) throw new Error("Failed to convert image");
        blob = await response.blob();
      } catch (fetchError) {
        // Fallback: create blob from data URL manually
        const base64 = dataUrl.split(",")[1];
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        blob = new Blob([bytes], { type: "image/png" });
      }

      const file = new File([blob], `receipt-${props.reference}.png`, {
        type: "image/png",
      });

      // Try native sharing first
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "Payment Receipt",
            text: `Receipt for payment reference: ${props.reference}`,
            files: [file],
          });
          toast.success("Receipt shared successfully");
          return;
        } catch (shareError) {
          console.warn("Native sharing failed, trying clipboard");
        }
      }

      // Fallback: try clipboard API
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          toast.success("Receipt copied to clipboard");
          return;
        }
      } catch (clipboardError) {
        console.warn("Clipboard API failed, trying download");
      }

      // Final fallback: download the file
      try {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `receipt-${props.reference}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Receipt downloaded to your device");
      } catch (downloadError) {
        throw new Error("All sharing methods failed");
      }
    } catch (error) {
      console.error("Error sharing receipt:", error);
      toast.error(
        "Failed to share receipt. Please try taking a screenshot instead.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Off-screen receipt for image generation */}
      <div className="absolute -left-[9999px] -top-[9999px] opacity-0 pointer-events-none">
        <ReceiptComponent ref={receiptRef} {...props} />
      </div>

      {/* Visible receipt preview */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h3 className="font-semibold mb-3 text-center">Receipt Preview</h3>
        <div className="scale-75 origin-top transform">
          <ReceiptComponent {...props} />
        </div>
      </div>

      {/* Download buttons */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={() => downloadAsImage("png")}
          disabled={isGenerating}
          className="bg-book-600 hover:bg-book-700"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PNG
        </Button>

        <Button
          onClick={() => downloadAsImage("jpeg")}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download JPEG
        </Button>

        <Button
          onClick={shareReceipt}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Share2 className="mr-2 h-4 w-4" />
          )}
          Share
        </Button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Receipt includes all purchase details and can be saved for your records
      </p>
    </div>
  );
};

export default ReceiptDownloader;
