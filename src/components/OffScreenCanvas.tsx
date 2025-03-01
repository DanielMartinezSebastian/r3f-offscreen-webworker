"use client";
import { lazy } from "react";
import { Canvas as _Canvas } from "@react-three/offscreen";
// import { Canvas } from "@react-three/fiber";

const AlternativeScene = lazy(() => import("@/scenes/AlternativeScene"));

console.log("OffScreenCanvas.tsx");

const worker = new Worker(
  new URL("../workers/sceneWorker.tsx", import.meta.url),
  {
    type: "module",
  }
);

export default function OffScreenCanvas() {
  return (
    <_Canvas
      className="h-full w-full"
      style={{ height: "100vh", width: "100%" }}
      worker={worker}
      fallback={<AlternativeScene />}
      shadows
      camera={{ position: [0, 5, 10], fov: 25 }}
    />

    // Testeo de Canvas de react-three/fiber
    // <Canvas
    //   style={{ height: "100vh", width: "100%" }}
    //   shadows
    //   camera={{ position: [0, 5, 10], fov: 25 }}
    // >
    //   <AlternativeScene />
    // </Canvas>
  );
}
