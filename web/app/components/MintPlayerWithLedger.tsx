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
  const fetchPrice = async (id = tokenId) => {
    setFetchingPrice(true);
    setPrice(null);
    setPriceError(null);
    try {
      const result = await publicClient.readContract({
        address: CURVE_LEAGUE_CONTRACT_ADDRESS,
        abi: CURVE_LEAGUE_CONTRACT_ABI,
        functionName: "getPrice",
        args: [id],
      });
      setPrice((result as bigint).toString());
      return (result as bigint).toString();
    } catch (err) {
      setPriceError(err);
      return null;
    } finally {
      setFetchingPrice(false);
    }
  };

  // Auto-fetch price on mount and when tokenId changes
  React.useEffect(() => {
    fetchPrice(tokenId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

  // Single-click mint logic
  const [mintLoading, setMintLoading] = useState(false);
  const [mintError, setMintError] = useState<any>(null);
  const [mintStep, setMintStep] = useState<string>("");

  const handleMint = async () => {
    setMintLoading(true);
    setMintError(null);
    setBroadcastHash(null);
    setSignTransactionOutput(undefined);
    setSignTransactionError(undefined);
    setSignTransactionState(undefined);
    setMintStep("Fetching price...");
    try {
      // 1. Fetch price
      const freshPrice = await fetchPrice(tokenId);
      if (!freshPrice) throw new Error("Failed to fetch price");
      setMintStep("Fetching nonce...");
      // 2. Fetch nonce
      if (!address) throw new Error("No address");
      const provider = new ethers.JsonRpcProvider(
        "https://coston2-api.flare.network/ext/C/rpc"
      );
      const n = await provider.getTransactionCount(address);
      setNonce(n);
      setMintStep("Building transaction...");
      // 3. Build unsigned tx
      const iface = new ethers.Interface(CURVE_LEAGUE_CONTRACT_ABI);
      const data = iface.encodeFunctionData("mintPlayer", [BigInt(tokenId)]);
      const tx = {
        to: CURVE_LEAGUE_CONTRACT_ADDRESS,
        value: freshPrice,
        nonce: n,
        gasLimit,
        gasPrice,
        data,
        chainId: CHAIN_ID,
      };
      setUnsignedTx(tx);
      const unsignedHex = ethers.Transaction.from(tx).unsignedSerialized;
      setUnsignedTxHex(unsignedHex);
      setMintStep("Signing transaction on Ledger...");
      // 4. Sign transaction
      await new Promise<void>((resolve, reject) => {
        signTransaction(
          "44'/60'/0'/0",
          unsignedHex,
          setSignTransactionState,
          (output: any) => {
            setSignTransactionOutput(output);
            resolve();
          },
          (err: any) => {
            setSignTransactionError(err);
            reject(err);
          }
        );
      });
      setMintStep("Broadcasting transaction...");
      // 5. Broadcast
      const { v, r, s } = signTransactionOutput || {};
      if (!v || !r || !s) throw new Error("No signature from Ledger");
      const signedTxHex = ethers.Transaction.from({
        ...tx,
        signature: { v, r, s },
      }).serialized;
      const hash = await broadcastTransaction(signedTxHex);
      setBroadcastHash(hash);
      setMintStep("Done");
    } catch (err) {
      setMintError(err);
      setMintStep("");
    } finally {
      setMintLoading(false);
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
        {fetchingPrice ? (
          <p>Fetching Price...</p>
        ) : price ? (
          <LabelizedJSON label="Price (wei)" value={price} />
        ) : priceError ? (
          <LabelizedJSON label="Price Error" value={priceError} />
        ) : null}
      </SectionContainer>
      <Divider />
      {address && keyringEth ? (
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
          <button onClick={handleMint} disabled={mintLoading || fetchingPrice}>
            {mintLoading ? `Minting... ${mintStep}` : "Mint"}
          </button>
          {mintError && <LabelizedJSON label="Mint Error" value={mintError} />}
          {mintStep && !mintLoading && <p>Step: {mintStep}</p>}
          {unsignedTx && (
            <LabelizedJSON label="Unsigned Tx" value={unsignedTx} />
          )}
          {unsignedTxHex && (
            <LabelizedJSON label="Unsigned Tx Hex" value={unsignedTxHex} />
          )}
          {signTransactionError && (
            <LabelizedJSON
              label="Sign transaction error"
              value={signTransactionError}
            />
          )}
          {signTransactionState && (
            <LabelizedJSON
              label="Sign transaction device action state"
              value={signTransactionState}
            />
          )}
          {signTransactionOutput && (
            <LabelizedJSON
              label="Sign transaction device action output"
              value={signTransactionOutput}
            />
          )}
          {broadcastHash && (
            <LabelizedJSON label="Broadcasted Tx Hash" value={broadcastHash} />
          )}
          {broadcastError && (
            <LabelizedJSON label="Broadcast Error" value={broadcastError} />
          )}
        </SectionContainer>
      ) : (
        <SectionContainer>
          <p>Please connect your Ledger wallet before minting.</p>
          <LedgerConnectButton />
        </SectionContainer>
      )}
    </div>
  );
};

export default MintPlayerWithLedger;
