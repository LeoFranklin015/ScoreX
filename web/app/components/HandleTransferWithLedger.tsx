"use client";
import React, { useState, useEffect } from "react";
import { publicClient } from "../lib/client";
import {
  CURVE_LEAGUE_CONTRACT_ADDRESS,
  CURVE_LEAGUE_CONTRACT_ABI,
} from "../lib/const";
import { useLedger } from "./Provider";
import { ethers } from "ethers";
import { LabelizedInput } from "./LabelizedInput";
import { LabelizedJSON } from "./LabelizedJSON";
import { SectionContainer } from "./SectionContainer";
import { Divider } from "./Divider";
import { LedgerConnectButton } from "./LedgerConnectButton";

const CHAIN_ID = 114; // Flare Testnet

export const HandleTransferWithLedger: React.FC = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tokenId, setTokenId] = useState(0);
  const [amount, setAmount] = useState(1);

  const [nonce, setNonce] = useState<number | null>(null);
  const [gasLimit, setGasLimit] = useState(150000);
  const [gasPrice, setGasPrice] = useState("30000000000"); // 30 gwei

  const [unsignedTx, setUnsignedTx] = useState<any>(null);
  const [unsignedTxHex, setUnsignedTxHex] = useState<string | null>(null);

  const [signTransactionOutput, setSignTransactionOutput] = useState<any>();
  const [signTransactionError, setSignTransactionError] = useState<any>();
  const [signTransactionState, setSignTransactionState] = useState<any>();

  const [broadcastHash, setBroadcastHash] = useState<string | null>(null);
  const [broadcastError, setBroadcastError] = useState<any>(null);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const {
    getAddress,
    signTransaction,
    broadcastTransaction,
    address,
    keyringEth,
  } = useLedger();

  // Fetch nonce for the sender address
  const fetchNonce = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(
      "https://coston2-api.flare.network/ext/C/rpc"
    );
    const n = await provider.getTransactionCount(address);
    setNonce(n);
  };

  // When address is set, fetch nonce
  useEffect(() => {
    if (address) {
      setFrom(address); // autofill from address
      fetchNonce(address);
    }
  }, [address]);

  // Build unsigned transaction for handleTransfer
  const buildUnsignedTx = async () => {
    if (!address || !from || !to || nonce === null) return;
    const iface = new ethers.Interface(CURVE_LEAGUE_CONTRACT_ABI);
    const data = iface.encodeFunctionData("handleTransfer", [
      from,
      to,
      BigInt(tokenId),
      BigInt(amount),
    ]);
    const tx = {
      to: CURVE_LEAGUE_CONTRACT_ADDRESS,
      value: 0,
      nonce,
      gasLimit,
      gasPrice,
      data,
      chainId: CHAIN_ID,
    };
    setUnsignedTx(tx);
    setUnsignedTxHex(ethers.Transaction.from(tx).unsignedSerialized);
  };

  // Rebuild unsigned tx when relevant fields change
  useEffect(() => {
    if (address && from && to && nonce !== null) {
      buildUnsignedTx();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, from, to, tokenId, amount, gasLimit, gasPrice, nonce]);

  // Signing logic: sign the unsignedTxHex
  const handleSignTransaction = () => {
    setSignTransactionOutput(undefined);
    setSignTransactionError(undefined);
    setSignTransactionState(undefined);
    if (!unsignedTxHex) return;
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
        <LedgerConnectButton />
        <h3>Handle Transfer with Ledger</h3>
        <LabelizedInput
          label="From Address"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <LabelizedInput
          label="To Address"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <LabelizedInput
          label="Token ID"
          value={tokenId.toString()}
          onChange={(e) => setTokenId(Number(e.target.value))}
        />
        <LabelizedInput
          label="Amount"
          value={amount.toString()}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
      </SectionContainer>
      <Divider />
      {keyringEth ? (
        <>
          <SectionContainer>
            <h3>Transfer Transaction</h3>
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
            <button onClick={handleSignTransaction} disabled={!unsignedTxHex}>
              Sign Transfer Transaction
            </button>
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
            <h3>Broadcast Signed Transfer Transaction</h3>
            <button
              disabled={!signTransactionOutput || broadcastLoading}
              onClick={handleBroadcast}
            >
              {broadcastLoading
                ? "Broadcasting..."
                : "Broadcast Transfer Transaction"}
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
};

export default HandleTransferWithLedger;
