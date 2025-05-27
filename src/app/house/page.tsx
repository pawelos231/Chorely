'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export default function HouseVisualizationPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5a27 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // House base (cube)
    const houseGeometry = new THREE.BoxGeometry(3, 2, 3);
    const houseMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = 1;
    house.castShadow = true;
    scene.add(house);

    // Roof (pyramid)
    const roofGeometry = new THREE.ConeGeometry(2.5, 1.5, 4);
    const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 2.75;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    scene.add(roof);

    // Door (smaller cube)
    const doorGeometry = new THREE.BoxGeometry(0.5, 1, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, 0.5, 1.55);
    scene.add(door);

    // Windows (spheres for now)
    const windowGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });
    
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-0.8, 1.2, 1.55);
    scene.add(window1);

    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
    window2.position.set(0.8, 1.2, 1.55);
    scene.add(window2);

    // Trees (cones on cylinders)
    const createTree = (x: number, z: number) => {
      const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, 0.5, z);
      trunk.castShadow = true;
      scene.add(trunk);

      const leavesGeometry = new THREE.ConeGeometry(0.8, 2, 8);
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, 2, z);
      leaves.castShadow = true;
      scene.add(leaves);
    };

    createTree(-5, -3);
    createTree(5, -4);
    createTree(-4, 4);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Rotate the house slowly
      house.rotation.y += 0.005;
      roof.rotation.y += 0.005;
      door.rotation.y += 0.005;
      window1.rotation.y += 0.005;
      window2.rotation.y += 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!mountRef.current) return;
      
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header with Navigation */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors"
            >
              <span className="text-xl">←</span>
              <span>Back to Dashboard</span>
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-center mb-2">🏠 House Visualization</h1>
          <p className="text-gray-400 text-center">3D view of your household</p>
        </div>

        {/* 3D Scene Container */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-4">Interactive 3D House Model</h2>
            <p className="text-gray-400 text-sm mb-4">
              This is a basic 3D representation of your house. Future updates will include room layouts and member locations.
            </p>
          </div>
          
          <div 
            ref={mountRef} 
            className="w-full h-96 bg-gray-900"
            style={{ minHeight: '400px' }}
          />
          
          <div className="p-6 bg-gray-750 border-t border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-300">House Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-800 rounded"></div>
                <span className="text-gray-300">Roof</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-600 rounded"></div>
                <span className="text-gray-300">Landscape</span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">🏗️ Current Features</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Basic house structure with rotating animation</li>
              <li>• Roof and entrance visualization</li>
              <li>• Landscape elements (trees, ground)</li>
              <li>• Dynamic lighting and shadows</li>
              <li>• Responsive 3D viewport</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">🚀 Coming Soon</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• Individual room layouts</li>
              <li>• Member location indicators</li>
              <li>• Task location markers</li>
              <li>• Interactive room navigation</li>
              <li>• Customizable house layout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 