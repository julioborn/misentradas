import "server-only";
import QRCode from "qrcode";

export function generateQrDataUrl(value: string) {
  return QRCode.toDataURL(value, { margin: 1, width: 320 });
}
