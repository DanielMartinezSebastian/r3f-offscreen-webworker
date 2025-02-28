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
  const [hovered, setHover] = useState<boolean>(false);
  const [active, setActive] = useState<boolean>(false);
  const color = hovered ? "hotpink" : "orange";

  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta / 2;
      mesh.current.rotation.y += delta / 2;
    }
  });

  return (
    <>
      <Center ref={mesh}>
        <mesh
          geometry={nodes.cube.geometry}
          material={materials.base}
          onClick={(e) => (e.stopPropagation(), setActive(!active))}
          onPointerOver={(e) => (e.stopPropagation(), setHover(true))}
          onPointerOut={() => setHover(false)}
          scale={active ? 0.3 : 0.25}
        >
          <meshStandardMaterial color={color} />
        </mesh>
      </Center>
      <ContactShadows
        color={color}
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
