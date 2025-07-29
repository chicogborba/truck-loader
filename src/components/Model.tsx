import React from "react";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

export default function Model() {
  // Carrega o modelo da pasta public
  const gltf = useLoader(GLTFLoader, "/scene.glb");

  return (
    <primitive
      object={gltf.scene}
      position={[0, -50, -50]}  // posição central
      scale={[80, 80, 80]}     // escala normal
        rotation={[0, Math.PI / 2, 0]} // rotação para melhor visualização
    />
  );
}
