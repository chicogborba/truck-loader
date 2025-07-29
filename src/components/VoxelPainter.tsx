import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Voxel = { 
  id: string; 
  pos: [number, number, number]; 
  color: number;
};

interface VoxelPainterProps {
  gridWidth: number;
  gridHeight: number;
  maxHeight?: number;
  cellSize?: number;
}

export default function VoxelPainter({
  gridWidth,
  gridHeight,
  maxHeight = 10,
  cellSize = 50,
}: VoxelPainterProps) {
  const { scene } = useThree();
  const cubeGeo = useRef(new THREE.BoxGeometry(cellSize, cellSize, cellSize));

  // Voxels hardcoded com diferentes cores - posições ajustadas para a grid
  const voxels: Voxel[] = [
    // Base layer (primeira camada no chão)
    { id: "0-25-0", pos: [0 + cellSize/2, cellSize/2, 0 + cellSize/2], color: 0x3498db }, // azul - centro
    { id: "50-25-0", pos: [cellSize + cellSize/2, cellSize/2, 0 + cellSize/2], color: 0xe74c3c }, // vermelho - direita
    { id: "-50-25-0", pos: [-cellSize + cellSize/2, cellSize/2, 0 + cellSize/2], color: 0x2ecc71 }, // verde - esquerda
    { id: "0-25-50", pos: [0 + cellSize/2, cellSize/2, cellSize + cellSize/2], color: 0xf39c12 }, // laranja - frente
    { id: "0-25-100", pos: [0 + cellSize/2, cellSize/2, 2*cellSize + cellSize/2], color: 0x9b59b6 }, // roxo - mais frente
    
    // Second layer (segunda camada)
    { id: "0-75-0", pos: [0 + cellSize/2, 1.5*cellSize, 0 + cellSize/2], color: 0x1abc9c }, // turquesa
    { id: "50-75-50", pos: [cellSize + cellSize/2, 1.5*cellSize, cellSize + cellSize/2], color: 0xe67e22 }, // laranja escuro
    { id: "-50-75-50", pos: [-cellSize + cellSize/2, 1.5*cellSize, cellSize + cellSize/2], color: 0x34495e }, // cinza escuro
    
    // Third layer (terceira camada)
    { id: "0-125-0", pos: [0 + cellSize/2, 2.5*cellSize, 0 + cellSize/2], color: 0xf1c40f }, // amarelo
    { id: "0-125-50", pos: [0 + cellSize/2, 2.5*cellSize, cellSize + cellSize/2], color: 0x8e44ad }, // roxo escuro
    
    // Tower structure (torre)
    { id: "100-25-0", pos: [2*cellSize + cellSize/2, cellSize/2, 0 + cellSize/2], color: 0x95a5a6 }, // cinza claro
    { id: "100-75-0", pos: [2*cellSize + cellSize/2, 1.5*cellSize, 0 + cellSize/2], color: 0x95a5a6 },
    { id: "100-125-0", pos: [2*cellSize + cellSize/2, 2.5*cellSize, 0 + cellSize/2], color: 0x95a5a6 },
    { id: "100-175-0", pos: [2*cellSize + cellSize/2, 3.5*cellSize, 0 + cellSize/2], color: 0xc0392b }, // vermelho escuro (topo da torre)
    
    // Parede lateral (próximo à parede esquerda)
    { id: "-100-25-25", pos: [-2*cellSize + cellSize/2, cellSize/2, cellSize/2 + cellSize/2], color: 0x27ae60 },
    { id: "-100-75-25", pos: [-2*cellSize + cellSize/2, 1.5*cellSize, cellSize/2 + cellSize/2], color: 0x27ae60 },
    { id: "-100-25-75", pos: [-2*cellSize + cellSize/2, cellSize/2, 1.5*cellSize + cellSize/2], color: 0x27ae60 },
    { id: "-100-75-75", pos: [-2*cellSize + cellSize/2, 1.5*cellSize, 1.5*cellSize + cellSize/2], color: 0x27ae60 },
  ];

  useEffect(() => {
    // Ground grid
    const gridGeo = new THREE.BufferGeometry();
    const verts: number[] = [];
    const halfW = gridWidth / 2;
    const halfH = gridHeight / 2;
    
    // Ground lines
    for (let x = -halfW; x <= halfW; x += cellSize) {
      verts.push(x, 0, -halfH, x, 0, halfH);
    }
    for (let z = -halfH; z <= halfH; z += cellSize) {
      verts.push(-halfW, 0, z, halfW, 0, z);
    }
    
    gridGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(verts, 3)
    );
    const gridMat = new THREE.LineBasicMaterial({ color: 0x888888 });
    const groundGrid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(groundGrid);

    // Wall grids forming L (side at x = -halfW, back at z = halfH)
    const wallVerts: number[] = [];
    const maxY = maxHeight * cellSize;
    
    // Side wall (vertical at x = -halfW)
    for (let z = -halfH; z <= halfH; z += cellSize) {
      wallVerts.push(-halfW, 0, z, -halfW, maxY, z);
    }
    for (let y = 0; y <= maxY; y += cellSize) {
      wallVerts.push(-halfW, y, -halfH, -halfW, y, halfH);
    }
    
    // Back wall (vertical at z = halfH)
    for (let x = -halfW; x <= halfW; x += cellSize) {
      wallVerts.push(x, 0, halfH, x, maxY, halfH);
    }
    for (let y = 0; y <= maxY; y += cellSize) {
      wallVerts.push(-halfW, y, halfH, halfW, y, halfH);
    }
    
    const wallGeo = new THREE.BufferGeometry();
    wallGeo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(wallVerts, 3)
    );
    const wallGrid = new THREE.LineSegments(wallGeo, gridMat);
    scene.add(wallGrid);

    // Create voxel meshes
    const voxelMeshes: THREE.Mesh[] = [];
    
    voxels.forEach((voxel) => {
      const material = new THREE.MeshStandardMaterial({ color: voxel.color });
      const mesh = new THREE.Mesh(cubeGeo.current, material);
      mesh.position.set(...voxel.pos);
      mesh.userData = { voxel: true, id: voxel.id };
      scene.add(mesh);
      voxelMeshes.push(mesh);
    });

    // Cleanup
    return () => {
      scene.remove(groundGrid, wallGrid);
      voxelMeshes.forEach(mesh => {
        scene.remove(mesh);
        // mesh.material.dispose();
      });
    };
  }, [scene, gridWidth, gridHeight, cellSize, maxHeight]);

  return null;
}