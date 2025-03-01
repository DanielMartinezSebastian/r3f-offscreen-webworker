import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import {
  useGLTF,
  Center,
  ContactShadows,
  Environment,
  CameraControls,
} from "@react-three/drei";
import * as THREE from "three";
import { useSpring, a } from "@react-spring/three";
import { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
console.log("Scene.tsx");

type GLTFResult = GLTF & {
  nodes: {
    cube: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
  };
};

function Model() {
  const mesh = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/pmndrs.glb") as unknown as GLTFResult;
  const [active, setActive] = useState(false);
  const [hovered, setHovered] = useState(false);

  // 🔥 Animación con useSpring
  const { scale, rotationX } = useSpring({
    scale: active ? 0.3 : 0.25, // Se agranda al hacer click
    rotationX: active ? Math.PI * 2 : 0, // 🔄 Gira 3 vueltas (6 * 180°)
    config: { mass: 3, tension: 300, friction: 20 }, // Configuración de animación
  });

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta / 2;
      mesh.current.rotation.y += delta / 2;
    }
  });

  const realisticMaterial = {
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness: 1,
    roughness: 0.1,
  };

  return (
    <>
      <Center ref={mesh}>
        <a.mesh // 🔥 Se usa "a.mesh" para animaciones
          geometry={nodes.cube.geometry}
          material={materials.base}
          onClick={(e) => (e.stopPropagation(), setActive(!active))}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
          scale={scale} // 🔄 Se anima con useSpring
          rotation-x={rotationX} // 🔄 Animación de rotación
        >
          <meshStandardMaterial
            color={hovered ? "hotpink" : "orange"}
            {...realisticMaterial}
          />
        </a.mesh>
      </Center>
      <ContactShadows
        color={hovered ? "hotpink" : "orange"}
        position={[0, -1.5, 0]}
        blur={3}
        opacity={0.75}
      />
    </>
  );
}

export default function App() {
  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 5]} />
      <Model />
      <Environment preset="city" />
      <CameraControls minPolarAngle={Math.PI / 2} maxPolarAngle={Math.PI / 2} />
    </>
  );
}
