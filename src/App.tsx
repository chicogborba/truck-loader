import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import VoxelPainter from "./components/VoxelPainter";

export default function App() {
  return (
    <Canvas
      camera={{ position: [500, 800, 1300], fov: 45, near: 0.1, far: 5000 }}
      style={{ width: "100vw", height: "100vh", background: "#f0f0f0" }}
    >
      {/* Luzes */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[1, 0.75, 0.5]} intensity={0.8} />

      {/* Controles de câmera */}
      <OrbitControls />

      <VoxelPainter
        gridHeight={300}
        gridWidth={100}
        cellSize={10}
        // divisions={10}
        maxHeight={8}
      />
    </Canvas>
  );
}
