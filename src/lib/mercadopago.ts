import "server-only";
import { MercadoPagoConfig } from "mercadopago";

export function getPlatformMpConfig() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
}

export function getSellerMpConfig(sellerAccessToken: string) {
  return new MercadoPagoConfig({ accessToken: sellerAccessToken });
}
