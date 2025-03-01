import { Environment, OrbitControls } from "@react-three/drei";

export default function AlternativeScene() {
  console.log("AlternativeScene.tsx");

  const realisticMaterial = {
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    metalness: 0.5,
    roughness: 0.1,
  };

  return (
    <>
      <OrbitControls />
      <Environment
        preset="city"
        background
        near={0.51}
        far={1000}
        resolution={256}
      />
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial {...realisticMaterial} color="hotpink" />
      </mesh>
    </>
  );
}
