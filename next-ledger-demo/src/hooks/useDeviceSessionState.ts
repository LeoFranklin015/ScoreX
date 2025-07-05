"use client";
import { useEffect, useState } from "react";
import {
  DeviceSessionId,
  DeviceSessionState,
  DeviceManagementKit,
} from "@ledgerhq/device-management-kit";

export function useDeviceSessionState(
  sdk: DeviceManagementKit | null,
  deviceSessionId: DeviceSessionId | undefined
): DeviceSessionState | undefined {
  const [deviceSessionState, setDeviceSessionState] =
    useState<DeviceSessionState>();
  useEffect(() => {
    if (!deviceSessionId || !sdk) {
      setDeviceSessionState(undefined);
      return;
    }
    const sub = sdk
      .getDeviceSessionState({ sessionId: deviceSessionId })
      .subscribe(setDeviceSessionState);
    return () => sub.unsubscribe();
  }, [deviceSessionId, sdk]);
  return deviceSessionState;
}
