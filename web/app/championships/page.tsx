"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface Star {
  id: number;
  x: number;
  y: number;
  speed: number;
  type: number;
}

export default function ChampionshipsLanding() {
  const [stars, setStars] = useState<Star[]>([]);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const starCount = 200;
      const newStars: Star[] = [];

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          speed: Math.floor(Math.random() * 5) + 1,
          type: Math.floor(Math.random() * 10) + 1,
        });
      }

      setStars(newStars);
    };

    generateStars();
    setIsLoaded(true);

    // Animate stars
    const animateStars = () => {
      setStars((prevStars) =>
        prevStars.map((star) => ({
          ...star,
          x: star.x <= 0 ? window.innerWidth - 10 : star.x - star.speed,
        }))
      );
    };

    const interval = setInterval(animateStars, 1000 / 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="championships-container">
      {/* Animated Background */}
      <div ref={backgroundRef} className="background">
        {/* Animated Stars */}
        {stars.map((star) => (
          <div
            key={star.id}
            className={`star star-${star.type}`}
            style={{
              left: `${star.x}px`,
              top: `${star.y}px`,
            }}
          />
        ))}

        {/* Main Content Wrapper */}
        <div className="fof-wrapper">
          <div className="animated-bounce mybounce">
            <div className="fof-wrapper-inner bounceInLeft">
              {/* Football */}
              <div className="fof-ball">
                <Image
                  src="/placeholder.svg?height=372&width=372"
                  alt="Football"
                  width={372}
                  height={372}
                  className="spinning-ball"
                />
              </div>
              {/* Fire Effect */}
              <div id="fireplace">
                <div className="fire-effect"></div>
              </div>
            </div>
          </div>

          {/* Flags and Match Info */}
          <ul className="flags-wrapper">
            <li className="flag-slide-left">
              <div className="flag flag-se"></div>
            </li>
            <li>
              <p className="vs-text">VS.</p>
            </li>
            <li className="flag-slide-right">
              <div className="flag flag-ire"></div>
            </li>
            <li className="match-info">
              MONDAY June 13, 18:00 @ Stade de France
            </li>
          </ul>
        </div>

        {/* Animated Titles */}
        <h1 className="title title-top animated-text">EUROPEAN</h1>
        <h1 className="title animated-text">CHAMPIONSHIPS</h1>
      </div>
    </div>
  );
}
