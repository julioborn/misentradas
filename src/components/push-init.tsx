"use client";

import { useEffect } from "react";
import { initPushNotifications } from "@/lib/push-client";

export function PushInit() {
  useEffect(() => {
    initPushNotifications();
  }, []);

  return null;
}
