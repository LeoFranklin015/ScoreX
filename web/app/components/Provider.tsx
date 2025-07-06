"use client";
import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import {
  DeviceManagementKit,
  DeviceManagementKitBuilder,
  type DeviceSessionId,
  DeviceActionState,
  DeviceActionStatus,
  hexaStringToBuffer,
} from "@ledgerhq/device-management-kit";

import {
  webHidTransportFactory,
  webHidIdentifier,
} from "@ledgerhq/device-transport-kit-web-hid";

// import {
//   webBleTransportFactory,
//   webBleIdentifier,
// } from "@ledgerhq/device-transport-kit-web-ble";

import {
  SignerEth,
  SignerEthBuilder,
  type GetAddressDAOutput,
  type GetAddressDAError,
  type SignTransactionDAOutput,
  type SignTransactionDAError,
} from "@ledgerhq/device-signer-kit-ethereum";
import { firstValueFrom } from "rxjs";
import { ethers } from "ethers";

interface LedgerContextType {
  sdk: DeviceManagementKit | null;
  deviceSessionId: DeviceSessionId | undefined;
  connectionError: unknown;
  connectDevice: () => Promise<void>;
  keyringEth: SignerEth | undefined;
  getAddress: (
    derivationPath: string,
    setState: (
      state: DeviceActionState<GetAddressDAOutput, GetAddressDAError, any>
    ) => void,
    setOutput: (output: GetAddressDAOutput) => void,
    setError: (error: GetAddressDAError | Error | unknown) => void
  ) => void;
  signTransaction: (
    derivationPath: string,
    rawTransactionHex: string,
    setState: (
      state: DeviceActionState<
        SignTransactionDAOutput,
        SignTransactionDAError,
        any
      >
    ) => void,
    setOutput: (output: SignTransactionDAOutput) => void,
    setError: (error: SignTransactionDAError | Error | unknown) => void
  ) => void;
  setSessionId: React.Dispatch<
    React.SetStateAction<DeviceSessionId | undefined>
  >;
  setConnectionError: React.Dispatch<React.SetStateAction<unknown>>;
  broadcastTransaction: (signedTxHex: string) => Promise<string>;
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Always use window.location.origin for origin
  const getOrigin = () =>
    typeof window !== "undefined" ? window.location.origin : "";

  const [sdk] = useState<DeviceManagementKit>(() =>
    new DeviceManagementKitBuilder()
      .addTransport(webHidTransportFactory)
      // .addTransport(webBleTransportFactory)
      .build()
  );
  const [deviceSessionId, setSessionId] = useState<DeviceSessionId>();
  const [connectionError, setConnectionError] = useState<unknown>();
  const [address, setAddress] = useState<string | undefined>(undefined);

  // Load address from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAddress = localStorage.getItem("ledgerAddress");
      if (storedAddress) {
        setAddress(storedAddress);
      }
    }
  }, []);

  // Save address to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (address) {
        localStorage.setItem("ledgerAddress", address);
      } else {
        localStorage.removeItem("ledgerAddress");
      }
    }
  }, [address]);

  const connectDevice = useCallback(async () => {
    try {
      setSessionId(undefined);
      const discoveredDevice = await firstValueFrom(
        sdk.startDiscovering({ transport: webHidIdentifier })
      );
      // sdk.startDiscovering({ transport: webBleIdentifier })
      const sessionId = await sdk.connect({ device: discoveredDevice });
      setConnectionError(undefined);
      setSessionId(sessionId);
    } catch (e) {
      setConnectionError(e);
    }
  }, [sdk]);

  const keyringEth = useMemo(
    () =>
      deviceSessionId
        ? new SignerEthBuilder({
            dmk: sdk,
            sessionId: deviceSessionId,
            originToken:
              typeof window !== "undefined" ? window.location.origin : "",
          }).build()
        : undefined,
    [sdk, deviceSessionId]
  );

  const getAddress = useCallback(
    (
      derivationPath: string,
      setState: (
        state: DeviceActionState<GetAddressDAOutput, GetAddressDAError, any>
      ) => void,
      setOutput: (output: GetAddressDAOutput) => void,
      setError: (error: GetAddressDAError | Error | unknown) => void
    ) => {
      if (!keyringEth || !derivationPath) return;
      keyringEth
        .getAddress(derivationPath)
        .observable.subscribe((getAddressDAState) => {
          setState(getAddressDAState);
          switch (getAddressDAState.status) {
            case DeviceActionStatus.Completed:
              if (
                "output" in getAddressDAState &&
                getAddressDAState.output !== undefined
              ) {
                setOutput(getAddressDAState.output);
                setAddress(getAddressDAState.output.address);
              }
              break;
            case DeviceActionStatus.Error:
              if (
                "error" in getAddressDAState &&
                getAddressDAState.error !== undefined
              ) {
                setError(getAddressDAState.error);
              }
              break;
            default:
              break;
          }
        });
    },
    [keyringEth]
  );

  const signTransaction = useCallback(
    (
      derivationPath: string,
      rawTransactionHex: string,
      setState: (
        state: DeviceActionState<
          SignTransactionDAOutput,
          SignTransactionDAError,
          any
        >
      ) => void,
      setOutput: (output: SignTransactionDAOutput) => void,
      setError: (error: SignTransactionDAError | Error | unknown) => void
    ) => {
      if (!keyringEth || !derivationPath || !rawTransactionHex) return;
      const transaction: Uint8Array | null =
        hexaStringToBuffer(rawTransactionHex);
      if (transaction == null) {
        setError(new Error("Cannot convert rawTransactionHex to Uint8Array"));
        return;
      }
      keyringEth
        .signTransaction(derivationPath, transaction)
        .observable.subscribe((signTransactionDAState) => {
          setState(signTransactionDAState);
          switch (signTransactionDAState.status) {
            case DeviceActionStatus.Completed:
              if (
                "output" in signTransactionDAState &&
                signTransactionDAState.output !== undefined
              ) {
                setOutput(signTransactionDAState.output);
              }
              break;
            case DeviceActionStatus.Error:
              if (
                "error" in signTransactionDAState &&
                signTransactionDAState.error !== undefined
              ) {
                setError(signTransactionDAState.error);
              }
              break;
            default:
              break;
          }
        });
    },
    [keyringEth]
  );

  const broadcastTransaction = async (signedTxHex: string) => {
    // Use Sepolia testnet for safety; replace with mainnet if needed
    const provider = new ethers.JsonRpcProvider(
      "https://coston2-api.flare.network/ext/C/rpc"
    );
    const txResponse = await provider.broadcastTransaction(signedTxHex);
    return txResponse.hash;
  };

  const value = useMemo(
    () => ({
      sdk,
      deviceSessionId,
      connectionError,
      connectDevice,
      keyringEth,
      getAddress,
      signTransaction,
      setSessionId,
      setConnectionError,
      broadcastTransaction,
      address,
      setAddress,
    }),
    [
      sdk,
      deviceSessionId,
      connectionError,
      connectDevice,
      keyringEth,
      getAddress,
      signTransaction,
      address,
    ]
  );

  return (
    <LedgerContext.Provider value={value}>{children}</LedgerContext.Provider>
  );
};

export const useLedger = () => {
  const ctx = useContext(LedgerContext);
  if (!ctx) throw new Error("useLedger must be used within a LedgerProvider");
  return ctx;
};
