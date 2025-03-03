import * as THREE from "three";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Suspense,
} from "react";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { Environment, Stars } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry";
import perlin3 from "@/utils/perlin";
import { useSpring, a } from "@react-spring/three";

extend({ RoundedBoxGeometry });

// Cambiamos NUM a una prop con valor por defecto
function Cubes({ scale: s = 1, numCubes = 10, ...props }) {
  const NUM = numCubes; // Usar el prop pasado
  const TOT = NUM * NUM * NUM;
  const ref = useRef();
  const { clock } = useThree();
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    setObjects([...new Array(TOT)].map(() => new THREE.Object3D()));
  }, [TOT]); // 🔄 Se recrea cuando cambia TOT

  // garantizar que el número de cubos sea actualizado cuando cambie la prop
  useEffect(() => {
    if (ref.current) {
      ref.current.count = TOT;
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, [TOT]);

  const update = useCallback(() => {
    const positions = [];
    const time = clock.getElapsedTime() * (1 + 60);
    const threshold = 0.05 + 0.05 * Math.random();
    for (let z = -NUM / 2; z < NUM / 2; z += 1) {
      for (let y = -NUM / 2; y < NUM / 2; y += 1) {
        for (let x = -NUM / 2; x < NUM / 2; x += 1) {
          const noisex = perlin3(
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold)
          );
          const noisey = perlin3(
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold)
          );
          const noisez = perlin3(
            Math.abs(((z + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((x + 0.5) / (NUM / 2)) * time * threshold),
            Math.abs(((y + 0.5) / (NUM / 2)) * time * threshold)
          );
          const noise = noisex + noisey + noisez;
          positions.push(
            noise > 1.5 - threshold && noise < threshold + 1.5 ? 1 : 0
          );
        }
      }
    }
    return positions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clock]);

  const [positions, set] = useState(update);
  useEffect(() => {
    const id = setInterval(() => set(update), 1000);
    return () => clearInterval(id);
  }, [update]);

  const vec = new THREE.Vector3();
  useFrame(() => {
    if (objects.length !== TOT) return; // ⛔ Evitar acceder antes de tiempo

    let id = 0;
    for (let z = -NUM / 2; z < NUM / 2; z += 1) {
      for (let y = -NUM / 2; y < NUM / 2; y += 1) {
        for (let x = -NUM / 2; x < NUM / 2; x += 1) {
          const s = positions[id];
          objects[id].position.set(x, y, z); // ✅ Ahora siempre existe
          objects[id].scale.lerp(vec.set(s, s, s), 0.2 - id / TOT / 8);
          objects[id].updateMatrix();
          ref.current.setMatrixAt(id, objects[id++].matrix);
        }
      }
    }

    //rotating the cubes
    ref.current.rotation.y += 0.01;
    ref.current.rotation.x += 0.01;
    ref.current.instanceMatrix.needsUpdate = true;
  });

  const realisticMaterial = {
    clearcoat: 0.1,
    clearcoatRoughness: 0.1,
    metalness: 1,
    roughness: 0.1,
  };

  return (
    <group
      {...props}
      rotation={[Math.PI / 4, Math.PI / 2, 0]}
      position={[0, 0, 0]}
      scale={[0.3, 0.3, 0.3]}
    >
      <instancedMesh
        receiveShadow
        castShadow
        ref={ref}
        args={[null, null, TOT]}
      >
        <roundedBoxGeometry args={[1 * s, 1 * s, 1 * s, 1, 0.075 * s]} />
        <meshPhysicalMaterial
          color={new THREE.Color("black")}
          {...realisticMaterial}
        />
      </instancedMesh>
    </group>
  );
}

export default function CubesScene({ numCubes = 10 }) {
  const meshRef = useRef();
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cubes, setCubes] = useState(numCubes);

  useEffect(() => {
    setCubes(numCubes);
  }, [numCubes]);

  useEffect(() => {
    // Limpieza manual
    return () => {
      // Disposición explícita de recursos
      THREE.Cache.clear();
    };
  }, []);

  const { scale, rotation } = useSpring({
    scale: active ? 1.2 : hovered ? 1.1 : 0.6,
    rotation: active ? [0, Math.PI * 2, 0] : [0, 0, 0],
    config: { mass: 10, tension: 280, friction: 20 },
  });

  return (
    <>
      <Environment
        preset="dawn"
        background
        backgroundBlurriness={0.5}
        backgroundIntensity={0.1}
      />
      <Stars fade={true} count={1000} factor={4} speed={1} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 0, 2]} color={"blue"} intensity={2} />
      <pointLight position={[0, 0, 0]} color={"red"} intensity={20} />
      <spotLight position={[0, 0, 0]} color={"red"} intensity={20} />
      <Suspense fallback={null}>
        <a.group
          ref={meshRef}
          scale={scale}
          rotation={rotation}
          onClick={() => setActive(!active)}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <Cubes key={cubes + "-1"} numCubes={cubes} />
          <Cubes
            key={cubes + "-2"}
            numCubes={cubes}
            rotation={[0, 0, Math.PI]}
          />
          <Cubes
            key={cubes + "-3"}
            numCubes={cubes}
            rotation={[0, Math.PI, 0]}
          />
          <Cubes
            key={cubes + "-4"}
            numCubes={cubes}
            rotation={[0, Math.PI, Math.PI]}
          />
        </a.group>
      </Suspense>
    </>
  );
}
