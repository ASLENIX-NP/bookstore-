import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";

export default function Scanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      },
      false
    );

    const success = (decodedText) => {
      if (onScan) {
        onScan(decodedText);
      }
    };

    const error = () => {
      // ignore scan errors (normal in live scanning)
    };

    scanner.render(success, error);

    return () => {
      try {
        scanner.clear();
      } catch (err) {
        console.log("Scanner cleanup failed:", err);
      }
    };
  }, [onScan]);

  return (
    <div className="w-full">
      <div id="reader" />
    </div>
  );
}