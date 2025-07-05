"use client";
import React, { useState } from "react";
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

export const MintPlayerWithLedger: React.FC = () => {
  const [tokenId, setTokenId] = useState(0);
  const [price, setPrice] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<any>(null);
  const [fetchingPrice, setFetchingPrice] = useState(false);

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

  // Fetch price from contract
  const fetchPrice = async () => {
    setFetchingPrice(true);
    setPrice(null);
    setPriceError(null);
    try {
      const result = await publicClient.readContract({
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        functionName: "getPrice",
        args: [tokenId],
      });
      // result is expected to be BigInt
      setPrice((result as bigint).toString());
    } catch (err) {
      setPriceError(err);
    } finally {
      setFetchingPrice(false);
    }
  };

  // Fetch nonce for the sender address
  const fetchNonce = async (address: string) => {
    const provider = new ethers.JsonRpcProvider(
      "https://coston2-api.flare.network/ext/C/rpc"
    );
    const n = await provider.getTransactionCount(address);
    setNonce(n);
  };

  // Build unsigned transaction for mintPlayer
  const buildUnsignedTx = async () => {
    if (!address || !price || nonce === null) return;
    // Encode data for mintPlayer(tokenId)
    const iface = new ethers.Interface(CURVE_LEAGUE_CONTRACT_ABI);
    const data = iface.encodeFunctionData("mintPlayer", [BigInt(tokenId)]);
    const tx = {
      to: CURVE_LEAGUE_CONTRACT_ADDRESS,
      value: price,
      nonce,
      gasLimit,
      gasPrice,
      data,
      chainId: CHAIN_ID,
    };
    setUnsignedTx(tx);
    setUnsignedTxHex(ethers.Transaction.from(tx).unsignedSerialized);
  };

  // When address, price, or nonce changes, rebuild unsigned tx
  React.useEffect(() => {
    if (address && price && nonce !== null) {
      buildUnsignedTx();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, price, nonce, gasLimit, gasPrice, tokenId]);

  // When address is set, fetch nonce
  React.useEffect(() => {
    if (address) {
      fetchNonce(address);
    }
  }, [address]);

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
        <LedgerConnectButton />
        <h3>Mint Player with Ledger</h3>
        <LabelizedInput
          label="Token ID"
          value={tokenId.toString()}
          onChange={(e) => setTokenId(Number(e.target.value))}
        />
        <button onClick={fetchPrice} disabled={fetchingPrice}>
          {fetchingPrice ? "Fetching Price..." : "Fetch Price"}
        </button>
        {price && <LabelizedJSON label="Price (wei)" value={price} />}
        {priceError && <LabelizedJSON label="Price Error" value={priceError} />}
      </SectionContainer>
      <Divider />
      {keyringEth ? (
        <>
          <SectionContainer>
            <h3>Mint Transaction</h3>
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
              Sign Mint Transaction
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
            <h3>Broadcast Signed Mint Transaction</h3>
            <button
              disabled={!signTransactionOutput || broadcastLoading}
              onClick={handleBroadcast}
            >
              {broadcastLoading
                ? "Broadcasting..."
                : "Broadcast Mint Transaction"}
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

export default MintPlayerWithLedger;
