"use client";

import React, { useState, useEffect } from "react";

// Definir los tipos para las props
interface SceneControlsProps {
  worker: Worker;
  defaultNumCubes?: number;
}

// Definir tipos para los mensajes recibidos del worker
type WorkerResponse =
  | { type: "CONFIG_UPDATED"; numCubes: number }
  | { type: "SCENE_CHANGING"; scene: string }
  | { type: "SCENE_CHANGED"; scene: string }
  | { type: "ERROR"; message: string; stack?: string }
  | { type: "CRITICAL_ERROR"; message: string };

export default function SceneControls({
  worker,
  defaultNumCubes = 4,
}: SceneControlsProps) {
  const [numCubes, setNumCubes] = useState<number>(defaultNumCubes);
  const [currentScene, setCurrentScene] = useState<string>("CubesScene");
  const [isChangingScene, setIsChangingScene] = useState<boolean>(false);
  const [workerStatus, setWorkerStatus] = useState<string>("ready");

  // Manejar los mensajes recibidos del worker
  useEffect(() => {
    const handleWorkerMessage = (event: MessageEvent<WorkerResponse>) => {
      const { data } = event;

      switch (data.type) {
        case "CONFIG_UPDATED":
          setNumCubes(data.numCubes);
          setWorkerStatus("Config updated");
          break;
        case "SCENE_CHANGING":
          setIsChangingScene(true);
          setWorkerStatus(`Changing scene to ${data.scene}...`);
          break;
        case "SCENE_CHANGED":
          setCurrentScene(data.scene);
          setIsChangingScene(false);
          setWorkerStatus(`Scene changed to ${data.scene}`);
          break;
        case "ERROR":
          console.error("Worker error:", data.message);
          setWorkerStatus(`Error: ${data.message}`);
          break;
        case "CRITICAL_ERROR":
          console.error("Critical worker error:", data.message);
          setWorkerStatus(`Critical error: ${data.message}`);
          break;
      }
    };

    worker.addEventListener("message", handleWorkerMessage);
    return () => worker.removeEventListener("message", handleWorkerMessage);
  }, [worker]);

  // Enviar configuración actualizada al worker
  const updateCubes = (value: number) => {
    setNumCubes(value);
    worker.postMessage({ type: "UPDATE_CONFIG", numCubes: value });
  };

  // Cambiar la escena
  const changeScene = (scene: string) => {
    if (!isChangingScene) {
      worker.postMessage({ type: "UPDATE_SCENE", scene });
    }
  };

  return (
    <div className="absolute top-4 right-4 bg-black/70 p-3 rounded-lg text-white">
      <div className="mb-2">
        <span className="mr-2">Cubos: {numCubes}</span>
        <input
          type="range"
          min="1"
          max="10"
          value={numCubes}
          onChange={(e) => updateCubes(Number(e.target.value))}
          disabled={isChangingScene}
          className="w-36"
        />
      </div>

      <div className="flex gap-2 justify-around">
        <button
          onClick={() => changeScene("CubesScene")}
          disabled={isChangingScene || currentScene === "CubesScene"}
          className={`px-3 py-1 rounded ${
            currentScene === "CubesScene"
              ? "bg-blue-600"
              : "bg-blue-500 hover:bg-blue-600"
          } disabled:opacity-50`}
        >
          Cubos
        </button>

        <button
          onClick={() => changeScene("Scene")}
          disabled={isChangingScene || currentScene === "Scene"}
          className={`px-3 py-1 rounded ${
            currentScene === "Scene"
              ? "bg-green-600"
              : "bg-green-500 hover:bg-green-600"
          } disabled:opacity-50`}
        >
          Default
        </button>
      </div>

      {workerStatus !== "ready" && (
        <div className="mt-2 text-xs opacity-70">Estado: {workerStatus}</div>
      )}
    </div>
  );
}
