"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { countries, getUniversalLink } from "@selfxyz/core";
import {
  SelfQRcodeWrapper,
  SelfAppBuilder,
  type SelfApp,
} from "@selfxyz/qrcode";
import { ethers } from "ethers";
import { LedgerConnectButton } from "../components/LedgerConnectButton";
import { createPublicClient, http, parseAbi } from "viem";
import { PROOF_OF_PLAYER_CONTRACT_ABI } from "../lib/const";

const CONTRACT_ADDRESS = "0xBe7c6B96092156F7C6DcD576E042af3E6cE817b5";
const RPC_URL = process.env.NEXT_PUBLIC_CELO_ALFAJORES_RPC;

export default function Home() {
  const router = useRouter();
  const [linkCopied, setLinkCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [universalLink, setUniversalLink] = useState("");
  const [userId, setUserId] = useState(ethers.ZeroAddress);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [latestEvent, setLatestEvent] = useState<any>(null);

  // Use useEffect to ensure code only executes on the client side
  useEffect(() => {
    try {
      const app = new SelfAppBuilder({
        version: 2,
        appName: process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop",
        scope: process.env.NEXT_PUBLIC_SELF_SCOPE || "player-verification",
        endpoint: `${
          process.env.NEXT_PUBLIC_SELF_ENDPOINT ||
          "0xBe7c6B96092156F7C6DcD576E042af3E6cE817b5"
        }`,
        logoBase64: "https://i.postimg.cc/mrmVf9hm/self.png", // url of a png image, base64 is accepted but not recommended
        userId: "0x4b4b30e2E7c6463b03CdFFD6c42329D357205334",
        endpointType: "staging_celo",
        userIdType: "hex", // use 'hex' for ethereum address or 'uuid' for uuidv4
        userDefinedData: "276",
        disclosures: {
          // // what you want to verify from users' identity
          minimumAge: 18,
          ofac: true,
          excludedCountries: [
            countries.NORTH_KOREA,
            countries.IRAN,
            countries.RUSSIA,
          ],

          // //what you want users to reveal
          name: true,
          // issuing_state: true,
          nationality: true,
          date_of_birth: true,
          // passport_number: false,
          gender: true,
          // expiry_date: false,
        },
      }).build();

      setSelfApp(app);
      setUniversalLink(getUniversalLink(app));
    } catch (error) {
      console.error("Failed to initialize Self app:", error);
    }
  }, []);

  useEffect(() => {
    if (!RPC_URL) return;
    const client = createPublicClient({
      chain: {
        id: 44787,
        name: "Celo Alfajores",
        nativeCurrency: { name: "CELO", symbol: "CELO", decimals: 18 },
        rpcUrls: { default: { http: [RPC_URL] } },
      },
      transport: http(RPC_URL),
    });

    const unwatch = client.watchContractEvent({
      address: CONTRACT_ADDRESS,
      abi: PROOF_OF_PLAYER_CONTRACT_ABI,
      eventName: "playerVerified",
      pollingInterval: 5000,
      onLogs: (logs) => {
        if (logs.length > 0) {
          setLatestEvent(logs[logs.length - 1]);
        }
      },
      onError: (err) => {
        console.error("Error watching event:", err);
      },
    });

    return () => unwatch?.();
  }, []);

  const displayToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const copyToClipboard = () => {
    if (!universalLink) return;

    navigator.clipboard
      .writeText(universalLink)
      .then(() => {
        setLinkCopied(true);
        displayToast("Universal link copied to clipboard!");
        setTimeout(() => setLinkCopied(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        displayToast("Failed to copy link");
      });
  };

  const openSelfApp = () => {
    if (!universalLink) return;

    window.open(universalLink, "_blank");
    displayToast("Opening Self App...");
  };

  const handleSuccessfulVerification = () => {
    console.log("Verification successful!");
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-800">
          {process.env.NEXT_PUBLIC_SELF_APP_NAME || "Self Workshop"}
        </h1>
        <p className="text-sm sm:text-base text-gray-600 px-2">
          Scan QR code with Self Protocol App to verify your identity
        </p>
      </div>

      {/* Main content */}
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
        <div className="flex justify-center mb-4 sm:mb-6">
          {selfApp ? (
            <SelfQRcodeWrapper
              selfApp={selfApp}
              onSuccess={handleSuccessfulVerification}
              onError={() => {
                displayToast("Error: Failed to verify identity");
              }}
            />
          ) : (
            <div className="w-[256px] h-[256px] bg-gray-200 animate-pulse flex items-center justify-center">
              <p className="text-gray-500 text-sm">Loading QR Code...</p>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 mb-4 sm:mb-6">
          <button
            type="button"
            onClick={copyToClipboard}
            disabled={!universalLink}
            className="flex-1 bg-gray-800 hover:bg-gray-700 transition-colors text-white p-2 rounded-md text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {linkCopied ? "Copied!" : "Copy Universal Link"}
          </button>

          <button
            type="button"
            onClick={openSelfApp}
            disabled={!universalLink}
            className="flex-1 bg-blue-600 hover:bg-blue-500 transition-colors text-white p-2 rounded-md text-sm sm:text-base mt-2 sm:mt-0 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            Open Self App
          </button>
        </div>
        <div className="flex flex-col items-center gap-2 mt-2">
          <span className="text-gray-500 text-xs uppercase tracking-wide">
            User Address
          </span>
          <div className="bg-gray-100 rounded-md px-3 py-2 w-full text-center break-all text-sm font-mono text-gray-800 border border-gray-200">
            {userId ? (
              userId
            ) : (
              <span className="text-gray-400">Not connected</span>
            )}
          </div>
        </div>
        <LedgerConnectButton />

        {verificationSuccess && (
          <div className="bg-green-100 text-green-800 p-2 rounded mb-4 text-center">
            Verification successful! 🎉
          </div>
        )}

        <div className="mt-4">
          <h2 className="font-bold mb-2">Latest playerVerified Event</h2>
          {latestEvent ? (
            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(latestEvent, null, 2)}
            </pre>
          ) : (
            <span className="text-gray-500">Waiting for event...</span>
          )}
        </div>

        {/* Toast notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 bg-gray-800 text-white py-2 px-4 rounded shadow-lg animate-fade-in text-sm">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
