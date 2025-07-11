/* eslint-disable react/no-unknown-property */
"use client";
import { useEffect, useRef, useState } from "react";
import { Canvas, extend, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  Lightformer,
} from "@react-three/drei";
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  RigidBodyProps,
} from "@react-three/rapier";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import * as THREE from "three";
import { Text } from "@react-three/drei";

// Mock assets for now - in production you would use real GLB and PNG files
const mockCardGLB = "/placeholder.glb";
const mockLanyard = "/placeholder.png";

extend({ MeshLineGeometry, MeshLineMaterial });

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  onCardClick?: () => void;
  playerName?: string;
  playerTeam?: string;
  playerId?: string;
  playerImageUrl?: string;
}

export default function Lanyard({
  position = [0, 0, 30],
  gravity = [0, -40, 0],
  fov = 20,
  transparent = true,
  onCardClick,
  playerName = "Player",
  playerTeam = "Team",
  playerId = "ID",
  playerImageUrl,
}: LanyardProps) {
  return (
    <div className="relative z-0 w-full h-screen flex justify-center items-center transform scale-100 origin-center">
      <Canvas
        camera={{ position, fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) =>
          gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)
        }
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band
            onCardClick={onCardClick}
            playerName={playerName}
            playerTeam={playerTeam}
            playerId={playerId}
            playerImageUrl={playerImageUrl}
          />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  onCardClick?: () => void;
  playerName?: string;
  playerTeam?: string;
  playerId?: string;
  playerImageUrl?: string;
}

function Band({
  maxSpeed = 50,
  minSpeed = 0,
  onCardClick,
  playerName = "Player",
  playerTeam = "Team",
  playerId = "ID",
  playerImageUrl,
}: BandProps) {
  // Using "any" for refs since the exact types depend on Rapier's internals
  const band = useRef<any>(null);
  const fixed = useRef<any>(null);
  const j1 = useRef<any>(null);
  const j2 = useRef<any>(null);
  const j3 = useRef<any>(null);
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: any = {
    type: "dynamic" as RigidBodyProps["type"],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  // Mock geometry and materials since we don't have the actual GLB file
  const mockGeometry = new THREE.BoxGeometry(1.6, 2.25, 0.02);
  const mockMaterial = new THREE.MeshPhysicalMaterial({
    color: "#1a1a1a",
    clearcoat: 1,
    clearcoatRoughness: 0.15,
    roughness: 0.9,
    metalness: 0.8,
  });

  // Mock texture
  const texture = useTexture("/placeholder.svg");
  // Player image texture (if provided)
  const playerImageTexture = playerImageUrl ? useTexture(playerImageUrl) : null;

  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
        new THREE.Vector3(),
      ])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);

  const [isSmall, setIsSmall] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = (): void => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return (): void => window.removeEventListener("resize", handleResize);
  }, []);

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0],
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? "grabbing" : "grab";
      return () => {
        document.body.style.cursor = "auto";
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== "boolean") {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref) => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z,
      });
    }
    if (fixed.current) {
      [j1, j2].forEach((ref) => {
        if (!ref.current.lerped)
          ref.current.lerped = new THREE.Vector3().copy(
            ref.current.translation()
          );
        const clampedDistance = Math.max(
          0.1,
          Math.min(1, ref.current.lerped.distanceTo(ref.current.translation()))
        );
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = "chordal";
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody
          ref={fixed}
          {...segmentProps}
          type={"fixed" as RigidBodyProps["type"]}
        />
        <RigidBody
          position={[0.5, 0, 0]}
          ref={j1}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1, 0, 0]}
          ref={j2}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[1.5, 0, 0]}
          ref={j3}
          {...segmentProps}
          type={"dynamic" as RigidBodyProps["type"]}
        >
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={
            dragged
              ? ("kinematicPosition" as RigidBodyProps["type"])
              : ("dynamic" as RigidBodyProps["type"])
          }
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
            onPointerOver={() => hover(true)}
            onPointerOut={() => hover(false)}
            onPointerUp={(e: any) => {
              e.target.releasePointerCapture(e.pointerId);
              drag(false);
            }}
            onPointerDown={(e: any) => {
              e.target.setPointerCapture(e.pointerId);
              drag(
                new THREE.Vector3()
                  .copy(e.point)
                  .sub(vec.copy(card.current.translation()))
              );
            }}
            onClick={onCardClick}
          >
            {/* Mock Card */}
            <mesh geometry={mockGeometry} material={mockMaterial}>
              {/* Add a glow effect */}
              <meshPhysicalMaterial
                color="#0a0a0a"
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
                emissive="#00ff00"
                emissiveIntensity={0.1}
              />
            </mesh>

            {/* Mock Clip */}
            <mesh position={[0, 1, 0.01]}>
              <boxGeometry args={[0.3, 0.1, 0.05]} />
              <meshStandardMaterial
                color="#888888"
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>

            {/* Mock Clamp */}
            <mesh position={[0, 1.1, 0.01]}>
              <boxGeometry args={[0.2, 0.05, 0.03]} />
              <meshStandardMaterial color="#666666" />
            </mesh>

            {/* Player Name Text */}
            <Text
              position={[0, 0.3, 0.011]}
              fontSize={0.08}
              color="#00ff00"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.2}
              lineHeight={1}
            >
              {playerName.toUpperCase()}
            </Text>

            {/* Player Team Text */}
            <Text
              position={[0, 0.15, 0.011]}
              fontSize={0.05}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.2}
              lineHeight={1}
            >
              {playerTeam}
            </Text>

            {/* Player ID Text */}
            <Text
              position={[0, -0.3, 0.011]}
              fontSize={0.04}
              color="#888888"
              anchorX="center"
              anchorY="middle"
              maxWidth={1.2}
              lineHeight={1}
            >
              ID: {playerId}
            </Text>

            {/* Player Image (if provided) */}
            {playerImageTexture ? (
              <mesh position={[0, 0, 0.011]}>
                <planeGeometry args={[1.4, 0.8]} />
                <meshBasicMaterial
                  map={playerImageTexture}
                  transparent
                  opacity={0.95}
                />
              </mesh>
            ) : (
              <mesh position={[0, 0, 0.01]}>
                <planeGeometry args={[1.4, 0.8]} />
                <meshBasicMaterial color="#0a0a0a" transparent opacity={0.9} />
              </mesh>
            )}

            {/* Simple Logo - Top Right Corner */}
            <mesh position={[0.5, 0.35, 0.012]}>
              <planeGeometry args={[0.15, 0.15]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>

            {/* Logo Symbol - Simplified */}
            <mesh position={[0.5, 0.35, 0.013]}>
              <circleGeometry args={[0.035]} />
              <meshBasicMaterial color="#00ffaa" transparent opacity={1} />
            </mesh>

            {/* Small accent shapes */}
            <mesh position={[0.47, 0.38, 0.013]}>
              <planeGeometry args={[0.03, 0.03]} />
              <meshBasicMaterial color="#000000" transparent opacity={1} />
            </mesh>
            <mesh position={[0.53, 0.32, 0.013]}>
              <planeGeometry args={[0.03, 0.03]} />
              <meshBasicMaterial color="#000000" transparent opacity={1} />
            </mesh>
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <primitive object={new MeshLineGeometry()} />
        <primitive
          object={
            new MeshLineMaterial({
              color: "#00ff00",
              depthTest: false,
              resolution: isSmall ? [1000, 2000] : [1000, 1000],
              useMap: 1,
              map: texture,
              repeat: [-4, 1],
              lineWidth: 1,
            })
          }
        />
      </mesh>
    </>
  );
}
