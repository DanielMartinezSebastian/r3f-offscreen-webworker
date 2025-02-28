// Scene.jsx (a self contained webgl app)
export default function AlternativeScene() {
  console.log("AlternativeScene.tsx");
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color={0x00ff00} />
    </mesh>
  );
}
