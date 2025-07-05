"use client";
import React, { useMemo, useState } from "react";
import { useLedger } from "./Provider";
import { useDeviceSessionState } from "../hooks/useDeviceSession";
import { DeviceStatus } from "@ledgerhq/device-management-kit";

function shortenAddress(address?: string) {
  if (!address) return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

export const LedgerConnectButton: React.FC = () => {
  const {
    sdk,
    deviceSessionId,
    connectionError,
    connectDevice,
    keyringEth,
    getAddress,
    address,
    setAddress,
  } = useLedger();
  const deviceSessionState = useDeviceSessionState(sdk, deviceSessionId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch address if connected and not locked, and not already set
  React.useEffect(() => {
    if (
      keyringEth &&
      deviceSessionId &&
      deviceSessionState?.deviceStatus === DeviceStatus.CONNECTED &&
      !address
    ) {
      getAddress(
        "44'/60'/0'/0",
        () => {},
        (output) => setAddress(output.address),
        (err) =>
          setError(
            typeof err === "object" && err && "message" in err
              ? (err as any).message
              : String(err) || "Failed to get address"
          )
      );
    }
  }, [
    keyringEth,
    deviceSessionId,
    deviceSessionState?.deviceStatus,
    getAddress,
    address,
    setAddress,
  ]);

  // Button click handler
  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connectDevice();
    } catch (e: any) {
      setError(e?.message || "Failed to connect");
    } finally {
      setLoading(false);
    }
  };

  // Determine button state
  let content = null;
  if (!deviceSessionId) {
    content = (
      <button
        onClick={handleConnect}
        className="px-4 py-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-60 flex items-center gap-2"
        disabled={loading}
        title={error || (connectionError ? String(connectionError) : "")}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4 mr-2 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        )}
        Connect Ledger
      </button>
    );
  } else if (deviceSessionState?.deviceStatus === DeviceStatus.LOCKED) {
    content = (
      <span
        className="px-4 py-2 rounded-md bg-orange-400 text-white font-semibold shadow flex items-center gap-2"
        title="Device is locked"
      >
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
        Locked
      </span>
    );
  } else if (address) {
    content = (
      <span
        className="px-4 py-2 rounded-md bg-green-600 text-white font-semibold shadow flex items-center gap-2"
        title={address}
      >
        <svg
          className="h-4 w-4 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        {shortenAddress(address)}
      </span>
    );
  } else {
    content = (
      <span
        className="px-4 py-2 rounded-md bg-gray-400 text-white font-semibold shadow flex items-center gap-2"
        title="Connecting..."
      >
        <svg
          className="h-4 w-4 text-white animate-pulse"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="10" />
        </svg>
        Connecting...
      </span>
    );
  }

  return (
    <div className="relative group">
      {content}
      {error && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-max bg-red-600 text-white text-xs rounded px-2 py-1 shadow-lg z-10 opacity-0 group-hover:opacity-100 transition">
          {error}
        </div>
      )}
    </div>
  );
};
