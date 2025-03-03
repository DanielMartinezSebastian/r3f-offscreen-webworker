"use client";

import { lazy } from "react";
import { Canvas as Canvas_offScreen } from "@react-three/offscreen";
import SceneControls from "@/components/SceneControls";

const AlternativeScene = lazy(() => import("@/scenes/AlternativeScene"));

console.log("OffScreenCanvas.tsx");

// Crear el worker fuera del componente
const worker: Worker = new Worker(
  new URL("../workers/sceneWorker.tsx", import.meta.url),
  { type: "module" }
);

export default function OffScreenCanvas() {
  return (
    <>
      <Canvas_offScreen
        className="h-full w-full"
        style={{ height: "100vh", width: "100%" }}
        worker={worker}
        fallback={<AlternativeScene />}
        shadows
        camera={{ position: [0, 5, 10], fov: 25 }}
      />
      <SceneControls worker={worker} defaultNumCubes={4} />
    </>
  );
}
