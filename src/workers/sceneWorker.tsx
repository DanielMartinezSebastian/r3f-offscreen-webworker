import { render } from "@react-three/offscreen";
import React, { useEffect, useState, Suspense, lazy } from "react";
// Importar solo los IDs/referencias de las escenas, no las escenas completas
import Scene from "@/scenes/Scene";

// Usar lazy loading para cargar las escenas solo cuando se necesiten
const LazyCubesScene = lazy(() => import("@/scenes/CubesScene"));

// Definir tipos para los mensajes
type WorkerMessage =
  | { type: "UPDATE_CONFIG"; numCubes?: number }
  | { type: "UPDATE_SCENE"; scene?: string };

type WorkerResponse =
  | { type: "CONFIG_UPDATED"; numCubes: number }
  | { type: "SCENE_CHANGING"; scene: string }
  | { type: "SCENE_CHANGED"; scene: string }
  | { type: "ERROR"; message: string; stack?: string }
  | { type: "CRITICAL_ERROR"; message: string };

// Componente de fallback ligero para mostrar mientras carga
const LoadingFallback = () => (
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshBasicMaterial color="white" wireframe />
  </mesh>
);

function SceneWithConfig() {
  const [numCubes, setNumCubes] = useState<number>(4); // Valor inicial más conservador
  const [currentScene, setCurrentScene] = useState<string>("CubesScene");
  const [isChangingScene, setIsChangingScene] = useState<boolean>(false);
  // Añadimos un key para forzar remontado completo
  const [sceneKey, setSceneKey] = useState<number>(0);

  useEffect(() => {
    // Gestor de mensajes mejorado
    const handleMessage = (event: MessageEvent<WorkerMessage>) => {
      try {
        if (event.data.type === "UPDATE_CONFIG") {
          if (event.data.numCubes !== undefined) {
            // Limitar el valor máximo para evitar bloqueos
            const safeNumCubes = Math.min(event.data.numCubes, 10);
            setNumCubes(safeNumCubes);
            console.log("Worker: Actualizando numCubes a", safeNumCubes);

            // Notificar al hilo principal
            (self as DedicatedWorkerGlobalScope).postMessage({
              type: "CONFIG_UPDATED",
              numCubes: safeNumCubes,
            } as WorkerResponse);
          }
        }

        if (event.data.type === "UPDATE_SCENE") {
          const newScene = event.data.scene;
          if (newScene && newScene !== currentScene) {
            console.log("Worker: Preparando cambio de escena a", newScene);

            // 1. Señalizar que estamos cambiando la escena
            setIsChangingScene(true);

            // 2. Notificar al hilo principal que comenzamos el cambio
            (self as DedicatedWorkerGlobalScope).postMessage({
              type: "SCENE_CHANGING",
              scene:
                (event.data as { type: "UPDATE_SCENE"; scene?: string })
                  .scene || currentScene,
            } as WorkerResponse);

            // 3. Realizar limpieza más agresiva con una secuencia controlada
            setTimeout(() => {
              // 4. Incrementar la key para forzar un remontado completo
              setSceneKey((prevKey) => prevKey + 1);

              // 5. Cambiar la escena después de la limpieza
              setTimeout(() => {
                setCurrentScene(
                  event.data.type === "UPDATE_SCENE" && event.data.scene
                    ? event.data.scene
                    : currentScene
                );

                // 6. Finalizar el cambio después de un tiempo para permitir montaje
                setTimeout(() => {
                  setIsChangingScene(false);
                  (self as DedicatedWorkerGlobalScope).postMessage({
                    type: "SCENE_CHANGED",
                    scene:
                      event.data.type === "UPDATE_SCENE"
                        ? event.data.scene || currentScene
                        : currentScene,
                  } as WorkerResponse);
                }, 200);
              }, 100);
            }, 150);
          }
        }
      } catch (error) {
        console.error("Error en worker:", error);
        // Notificar al hilo principal del error
        (self as DedicatedWorkerGlobalScope).postMessage({
          type: "ERROR",
          message: (error as Error).message,
          stack: (error as Error).stack,
        } as WorkerResponse);
      }
    };

    self.addEventListener("message", handleMessage);
    return () => self.removeEventListener("message", handleMessage);
  }, [currentScene, sceneKey]); // Añadimos sceneKey como dependencia

  // Renderizado con key para forzar nuevo montaje
  return (
    <Suspense fallback={<LoadingFallback />}>
      {!isChangingScene ? (
        <React.Fragment key={sceneKey}>
          {currentScene === "CubesScene" && (
            <LazyCubesScene numCubes={numCubes} />
          )}
          {currentScene === "Scene" && <Scene />}
        </React.Fragment>
      ) : (
        <LoadingFallback />
      )}
    </Suspense>
  );
}

// Manejo de errores global para el worker
try {
  render(<SceneWithConfig />);
} catch (error) {
  console.error("Error crítico en worker:", error);
  (self as DedicatedWorkerGlobalScope).postMessage({
    type: "CRITICAL_ERROR",
    message: (error as Error).message,
  } as WorkerResponse);
}
