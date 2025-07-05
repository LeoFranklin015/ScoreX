"use client";
import React, { useState, useMemo } from "react";
import { LedgerProvider, useLedger } from "../components/Provider";
import { useDeviceSessionState } from "../hooks/useDeviceSession";
import { DeviceSessionUI } from "../components/DeviceSessionUI";
import { LabelizedInput } from "../components/LabelizedInput";
import { LabelizedJSON } from "../components/LabelizedJSON";
import { Divider } from "../components/Divider";
import { SectionContainer } from "../components/SectionContainer";
import { DeviceStatus } from "@ledgerhq/device-management-kit";
import { ethers } from "ethers";

function LedgerDemo() {
  const {
    sdk,
    deviceSessionId,
    connectionError,
    connectDevice,
    keyringEth,
    getAddress,
    signTransaction,
    broadcastTransaction,
  } = useLedger();

  const deviceSessionState = useDeviceSessionState(sdk, deviceSessionId);

  // Transaction fields for sending 0.001 ETH on Sepolia
  const [to, setTo] = useState("0xd69a4dd0dfb261a8EF37F45925491C077EF1dBFb");
  const [value, setValue] = useState("0.001"); // ETH
  const [nonce, setNonce] = useState(0);
  const [gasLimit, setGasLimit] = useState(21000);
  const [gasPrice, setGasPrice] = useState("30000000000"); // 30 gwei

  // Provider for Sepolia
  const provider = new ethers.JsonRpcProvider(
    "https://coston2-api.flare.network/ext/C/rpc"
  );

  // Build unsigned tx
  const unsignedTx = useMemo(() => {
    return {
      to,
      value: ethers.parseEther(value),
      nonce,
      gasLimit,
      gasPrice,
      chainId: 114,
    };
  }, [to, value, nonce, gasLimit, gasPrice]);

  // Serialize unsigned tx for display
  const unsignedTxHex = useMemo(() => {
    return ethers.Transaction.from(unsignedTx).unsignedSerialized;
  }, [unsignedTx]);

  const [getAddressOutput, setGetAddressOutput] = useState<any>();
  const [getAddressError, setGetAddressError] = useState<any>();
  const [getAddressState, setGetAddressState] = useState<any>();

  const [signTransactionOutput, setSignTransactionOutput] = useState<any>();
  const [signTransactionError, setSignTransactionError] = useState<any>();
  const [signTransactionState, setSignTransactionState] = useState<any>();

  const [broadcastHash, setBroadcastHash] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<any>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Fetch nonce for the sender address
  const fetchNonce = async (address: string) => {
    const n = await provider.getTransactionCount(address);
    setNonce(n);
  };

  // When address is set, fetch nonce
  React.useEffect(() => {
    if (getAddressOutput && getAddressOutput.address) {
      fetchNonce(getAddressOutput.address);
    }
  }, [getAddressOutput]);

  // Signing logic: sign the unsignedTxHex
  const handleSignTransaction = () => {
    setSignTransactionOutput(undefined);
    setSignTransactionError(undefined);
    setSignTransactionState(undefined);
    signTransaction(
      "44'/60'/0'/0", // default derivation path
      unsignedTxHex,
      setSignTransactionState,
      setSignTransactionOutput,
      setSignTransactionError
    );
  };

  // Broadcast logic: reconstruct signed tx and send
  const handleBroadcast = async () => {
    setBroadcastHash(null);
    setBroadcastError(null);
    setBroadcastLoading(true);
    try {
      // Reconstruct signed tx from v, r, s and unsignedTx
      const { v, r, s } = signTransactionOutput;
      const signedTxHex = ethers.Transaction.from({
        ...unsignedTx,
        signature: { v, r, s },
      }).serialized;
      const hash = await broadcastTransaction(signedTxHex);
      setBroadcastHash(hash);
    } catch (err) {
      setBroadcastError(err);
    } finally {
      setBroadcastLoading(false);
    }
  };

  return (
    <div className="card">
      <SectionContainer>
        <h3>Device Management Kit: Device Connection</h3>
        <button onClick={connectDevice}>
          Discover & connect a device (USB)
        </button>
        {connectionError ? (
          <LabelizedJSON label="Connection error" value={connectionError} />
        ) : (
          <DeviceSessionUI
            deviceSessionId={deviceSessionId}
            deviceSessionState={deviceSessionState}
          />
        )}
      </SectionContainer>
      <Divider />
      {keyringEth ? (
        <>
          <SectionContainer>
            <h3>Ethereum Signer: Get Address</h3>
            <button
              onClick={() => {
                setGetAddressOutput(undefined);
                setGetAddressError(undefined);
                setGetAddressState(undefined);
                getAddress(
                  "44'/60'/0'/0",
                  setGetAddressState,
                  setGetAddressOutput,
                  setGetAddressError
                );
              }}
            >
              Get Ethereum address
            </button>
            {getAddressOutput && (
              <LabelizedJSON
                label="Sender Address"
                value={getAddressOutput.address}
              />
            )}
          </SectionContainer>
          <Divider />
          <SectionContainer>
            <h3>Send 0.001 ETH on Sepolia</h3>
            <LabelizedInput
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
            <LabelizedInput
              label="Value (ETH)"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            <LabelizedInput
              label="Gas Limit"
              value={gasLimit.toString()}
              onChange={(e) => setGasLimit(Number(e.target.value))}
            />
            <LabelizedInput
              label="Gas Price (wei)"
              value={gasPrice.toString()}
              onChange={(e) => setGasPrice(e.target.value)}
            />
            <LabelizedJSON label="Unsigned Tx" value={unsignedTx} />
            <LabelizedJSON label="Unsigned Tx Hex" value={unsignedTxHex} />
            <button onClick={handleSignTransaction}>Sign Transaction</button>
          </SectionContainer>
          {signTransactionError ? (
            <LabelizedJSON
              label="Sign transaction error"
              value={signTransactionError}
            />
          ) : (
            <>
              <LabelizedJSON
                label="Sign transaction device action state"
                value={signTransactionState}
              />
              <LabelizedJSON
                label="Sign transaction device action output"
                value={signTransactionOutput}
              />
            </>
          )}
          <Divider />
          <SectionContainer>
            <h3>Broadcast Signed Transaction</h3>
            <button
              disabled={!signTransactionOutput || broadcastLoading}
              onClick={handleBroadcast}
            >
              {broadcastLoading ? "Broadcasting..." : "Broadcast Transaction"}
            </button>
            {broadcastHash && (
              <LabelizedJSON
                label="Broadcasted Tx Hash"
                value={broadcastHash}
              />
            )}
            {broadcastError && (
              <LabelizedJSON label="Broadcast Error" value={broadcastError} />
            )}
          </SectionContainer>
        </>
      ) : (
        <p>Ethereum Signer not instantiated</p>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <LedgerProvider>
      <LedgerDemo />
    </LedgerProvider>
  );
}
