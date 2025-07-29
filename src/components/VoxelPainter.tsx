import { useRef, useEffect } from "react";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

type Voxel = { 
  id: string; 
  pos: [number, number, number]; // Coordenadas de grid simples [x, y, z]
  color: number;
};

interface VoxelPainterProps {
  gridWidth: number;
  gridHeight: number;
  maxHeight?: number;
  cellSize?: number;
}

// Função para criar uma caixa de voxels
function createBox(
  id: string,
  startPos: [number, number, number], // posição inicial [x, y, z]
  dimensions: [number, number, number], // dimensões [largura, altura, profundidade]
  color: number = 0x3498db
): Voxel[] {
  const [startX, startY, startZ] = startPos;
  const [width, height, depth] = dimensions;
  const voxels: Voxel[] = [];

  // Gera todos os voxels da caixa
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        voxels.push({
          id: `${id}_${x}_${y}_${z}`,
          pos: [startX + x, startY + y, startZ + z],
          color: color
        });
      }
    }
  }

  return voxels;
}

export default function VoxelPainter({
  gridWidth,
  gridHeight,
  maxHeight = 10,
  cellSize = 50,
}: VoxelPainterProps) {
  const { scene } = useThree();
  const cubeGeo = useRef(new THREE.BoxGeometry(cellSize, cellSize, cellSize));

  // Função para converter coordenadas de grid para posição 3D
  const gridToWorldPosition = (gridX: number, gridY: number, gridZ: number): [number, number, number] => {
    const halfW = gridWidth / 2;
    const halfH = gridHeight / 2;
    
    // Converte coordenadas de grid para posição world
    const worldX = (gridX * cellSize) - halfW + (cellSize / 2);
    const worldY = gridY * cellSize + (cellSize / 2);
    const worldZ = (gridZ * cellSize) - halfH + (cellSize / 2);
    
    return [worldX, worldY, worldZ];
  };


  const voxels: Voxel[] = [

    ...createBox("box1", [12, 0, 22], [3, 6, 3], 0x3498db),

    ...createBox("box1", [4, 0, 19], [6, 7, 6], 0xdb3444),

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

    // Create voxel meshes - usando a função de normalização
    const voxelMeshes: THREE.Mesh[] = [];
    
    voxels.forEach((voxel) => {
      const material = new THREE.MeshStandardMaterial({ color: voxel.color });
      const mesh = new THREE.Mesh(cubeGeo.current, material);
      
      // Converte grid coords para world coords
      const worldPos = gridToWorldPosition(voxel.pos[0], voxel.pos[1], voxel.pos[2]);
      mesh.position.set(...worldPos);
      
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