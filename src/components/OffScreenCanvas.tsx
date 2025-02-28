"use client";
import { lazy } from "react";
import { Canvas } from "@react-three/offscreen";

const AlternativeScene = lazy(() => import("@/scenes/Scene"));

console.log("OffScreenCanvas.tsx");

// This is the worker thread that will render the scene
const worker = new Worker(
  new URL("../workers/sceneWorker.tsx", import.meta.url),
  {
    type: "module",
  }
);

export default function OffScreenCanvas() {
  return (
    <Canvas
      className="border border-red-500 "
      worker={worker}
      fallback={<AlternativeScene />}
      shadows
      camera={{ position: [0, 5, 10], fov: 25 }}
    />
  );
}
