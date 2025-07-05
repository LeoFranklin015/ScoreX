import type { Metadata } from "next";
import Test from "../test-embed/page";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: "Nami AI | Donations",
    description:
      "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
    openGraph: {
      title: "Nami AI | Donations",
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
      images: ["/logo.png"],
    },
    other: {
      "twitter:player": `https://continued-fraser-farms-reviewer.trycloudflare.com/embed`,
      "x-frame-options": "ALLOWALL",
      "content-security-policy": "frame-ancestors *;",
    },
    twitter: {
      card: "player",
      site: "https://x.com/NamiAIStarknet",
      title: "Nami AI | Donations",
      images: ["https://stark-nami-ai.vercel.app/logo.png"],
      description:
        "An autonomous agent that discovers global disasters, collect donations and keeps NGO’s accountable.",
      players: [
        {
          playerUrl: `https://continued-fraser-farms-reviewer.trycloudflare.com/embed`,
          streamUrl: `https://continued-fraser-farms-reviewer.trycloudflare.com/
          embed`,
          width: 360,
          height: 560,
        },
      ],
    },
  };
}
export default function EmbedPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
      <Test />
    </div>
  );
}
