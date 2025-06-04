'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import toast from 'react-hot-toast';

interface HouseProperties {
  houseWidth: number;
  houseHeight: number;
  houseDepth: number;
  windowSize: number;
  doorWidth: number;
  doorHeight: number;
  hasGarage: boolean;
  hasSecondFloor: boolean;
  hasBalcony: boolean;
  hasChimney: boolean;
  roofType: 'peaked' | 'flat' | 'dome';
  houseColor: number;
  roofColor: number;
  windowType: 'square' | 'round' | 'arched';
  treeCount: number;
  hasFence: boolean;
  hasGarden: boolean;
  garageSize: number;
}

export default function HouseVisualizationPage() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);
  const [houseProps, setHouseProps] = useState<HouseProperties | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate random house properties
  const generateRandomHouse = (): HouseProperties => {
    const houseColors = [0x8b4513, 0xdaa520, 0xcd853f, 0xf4a460, 0xd2b48c, 0x228b22, 0x6495ed];
    const roofColors = [0x8b0000, 0x2f4f4f, 0x696969, 0x556b2f, 0x800080, 0x4b0082];
    
    return {
      houseWidth: 2.5 + Math.random() * 2, // 2.5-4.5
      houseHeight: 1.8 + Math.random() * 1.4, // 1.8-3.2
      houseDepth: 2.5 + Math.random() * 2, // 2.5-4.5
      windowSize: 0.2 + Math.random() * 0.4, // 0.2-0.6
      doorWidth: 0.4 + Math.random() * 0.3, // 0.4-0.7
      doorHeight: 0.8 + Math.random() * 0.6, // 0.8-1.4
      hasGarage: Math.random() > 0.6,
      hasSecondFloor: Math.random() > 0.5,
      hasBalcony: Math.random() > 0.7,
      hasChimney: Math.random() > 0.4,
      roofType: ['peaked', 'flat', 'dome'][Math.floor(Math.random() * 3)] as 'peaked' | 'flat' | 'dome',
      houseColor: houseColors[Math.floor(Math.random() * houseColors.length)],
      roofColor: roofColors[Math.floor(Math.random() * roofColors.length)],
      windowType: ['square', 'round', 'arched'][Math.floor(Math.random() * 3)] as 'square' | 'round' | 'arched',
      treeCount: 2 + Math.floor(Math.random() * 4), // 2-5 trees
      hasFence: Math.random() > 0.5,
      hasGarden: Math.random() > 0.3,
      garageSize: 0.8 + Math.random() * 0.7, // 0.8-1.5
    };
  };

  const buildHouse = (scene: THREE.Scene, props: HouseProperties) => {
    // Clear previous house objects
    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (child.userData.isHouse) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach(obj => scene.remove(obj));

    // House base
    const houseGeometry = new THREE.BoxGeometry(props.houseWidth, props.houseHeight, props.houseDepth);
    const houseMaterial = new THREE.MeshLambertMaterial({ color: props.houseColor });
    const house = new THREE.Mesh(houseGeometry, houseMaterial);
    house.position.y = props.houseHeight / 2;
    house.castShadow = true;
    house.userData.isHouse = true;
    scene.add(house);

    // Second floor
    if (props.hasSecondFloor) {
      const secondFloorGeometry = new THREE.BoxGeometry(props.houseWidth * 0.8, props.houseHeight * 0.7, props.houseDepth * 0.8);
      const secondFloor = new THREE.Mesh(secondFloorGeometry, houseMaterial);
      secondFloor.position.y = props.houseHeight + (props.houseHeight * 0.7) / 2;
      secondFloor.castShadow = true;
      secondFloor.userData.isHouse = true;
      scene.add(secondFloor);
    }

    // Roof
    const roofHeight = props.roofType === 'flat' ? 0.2 : 1.5;
    let roof: THREE.Mesh;
    
    if (props.roofType === 'peaked') {
      const roofGeometry = new THREE.ConeGeometry(Math.max(props.houseWidth, props.houseDepth) * 0.7, roofHeight, 4);
      roof = new THREE.Mesh(roofGeometry, new THREE.MeshLambertMaterial({ color: props.roofColor }));
      roof.rotation.y = Math.PI / 4;
    } else if (props.roofType === 'dome') {
      const roofGeometry = new THREE.SphereGeometry(Math.max(props.houseWidth, props.houseDepth) * 0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
      roof = new THREE.Mesh(roofGeometry, new THREE.MeshLambertMaterial({ color: props.roofColor }));
    } else {
      const roofGeometry = new THREE.BoxGeometry(props.houseWidth + 0.2, roofHeight, props.houseDepth + 0.2);
      roof = new THREE.Mesh(roofGeometry, new THREE.MeshLambertMaterial({ color: props.roofColor }));
    }
    
    const roofY = props.hasSecondFloor ? props.houseHeight + props.houseHeight * 0.7 + roofHeight / 2 : props.houseHeight + roofHeight / 2;
    roof.position.y = roofY;
    roof.castShadow = true;
    roof.userData.isHouse = true;
    scene.add(roof);

    // Chimney
    if (props.hasChimney) {
      const chimneyGeometry = new THREE.BoxGeometry(0.3, 0.8, 0.3);
      const chimneyMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
      const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
      chimney.position.set(props.houseWidth * 0.3, roofY + 0.4, props.houseDepth * 0.3);
      chimney.castShadow = true;
      chimney.userData.isHouse = true;
      scene.add(chimney);
    }

    // Door
    const doorGeometry = new THREE.BoxGeometry(props.doorWidth, props.doorHeight, 0.1);
    const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, props.doorHeight / 2, props.houseDepth / 2 + 0.05);
    door.userData.isHouse = true;
    scene.add(door);

    // Windows
    const createWindow = (x: number, y: number, z: number) => {
      let windowGeometry: THREE.BufferGeometry;
      
      if (props.windowType === 'round') {
        windowGeometry = new THREE.SphereGeometry(props.windowSize, 16, 16);
      } else if (props.windowType === 'arched') {
        windowGeometry = new THREE.CylinderGeometry(props.windowSize, props.windowSize, 0.1, 16, 1, false, 0, Math.PI);
      } else {
        windowGeometry = new THREE.BoxGeometry(props.windowSize * 2, props.windowSize * 2, 0.1);
      }
      
      const windowMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x87ceeb, 
        transparent: true, 
        opacity: 0.7 
      });
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(x, y, z);
      window.userData.isHouse = true;
      scene.add(window);
    };

    // Front windows
    createWindow(-props.houseWidth * 0.3, props.houseHeight * 0.6, props.houseDepth / 2 + 0.06);
    createWindow(props.houseWidth * 0.3, props.houseHeight * 0.6, props.houseDepth / 2 + 0.06);

    // Side windows
    createWindow(props.houseWidth / 2 + 0.06, props.houseHeight * 0.6, 0);
    createWindow(-props.houseWidth / 2 - 0.06, props.houseHeight * 0.6, 0);

    // Second floor windows
    if (props.hasSecondFloor) {
      createWindow(-props.houseWidth * 0.25, props.houseHeight + props.houseHeight * 0.4, props.houseDepth / 2 + 0.06);
      createWindow(props.houseWidth * 0.25, props.houseHeight + props.houseHeight * 0.4, props.houseDepth / 2 + 0.06);
    }

    // Balcony
    if (props.hasBalcony && props.hasSecondFloor) {
      const balconyGeometry = new THREE.BoxGeometry(props.houseWidth * 0.6, 0.1, 0.8);
      const balconyMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const balcony = new THREE.Mesh(balconyGeometry, balconyMaterial);
      balcony.position.set(0, props.houseHeight + 0.05, props.houseDepth / 2 + 0.4);
      balcony.userData.isHouse = true;
      scene.add(balcony);

      // Balcony railing
      for (let i = -2; i <= 2; i++) {
        const railGeometry = new THREE.BoxGeometry(0.05, 0.5, 0.05);
        const rail = new THREE.Mesh(railGeometry, balconyMaterial);
        rail.position.set(i * 0.2, props.houseHeight + 0.3, props.houseDepth / 2 + 0.8);
        rail.userData.isHouse = true;
        scene.add(rail);
      }
    }

    // Garage
    if (props.hasGarage) {
      const garageGeometry = new THREE.BoxGeometry(props.garageSize * 1.5, props.houseHeight * 0.8, props.garageSize);
      const garageMaterial = new THREE.MeshLambertMaterial({ color: props.houseColor * 0.8 });
      const garage = new THREE.Mesh(garageGeometry, garageMaterial);
      garage.position.set(props.houseWidth + props.garageSize, props.houseHeight * 0.4, 0);
      garage.castShadow = true;
      garage.userData.isHouse = true;
      scene.add(garage);

      // Garage door
      const garageDoorGeometry = new THREE.BoxGeometry(props.garageSize * 1.2, props.houseHeight * 0.6, 0.1);
      const garageDoorMaterial = new THREE.MeshLambertMaterial({ color: 0x2f4f4f });
      const garageDoor = new THREE.Mesh(garageDoorGeometry, garageDoorMaterial);
      garageDoor.position.set(props.houseWidth + props.garageSize, props.houseHeight * 0.3, props.garageSize / 2 + 0.05);
      garageDoor.userData.isHouse = true;
      scene.add(garageDoor);
    }

    // Garden
    if (props.hasGarden) {
      const gardenGeometry = new THREE.RingGeometry(3, 5, 16);
      const gardenMaterial = new THREE.MeshLambertMaterial({ color: 0x90ee90 });
      const garden = new THREE.Mesh(gardenGeometry, gardenMaterial);
      garden.rotation.x = -Math.PI / 2;
      garden.position.y = 0.01;
      garden.userData.isHouse = true;
      scene.add(garden);

      // Flowers
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 3.5 + Math.random() * 1;
        const flowerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const flowerColors = [0xff69b4, 0xff0000, 0xffff00, 0xff4500, 0x9370db];
        const flowerMaterial = new THREE.MeshLambertMaterial({ 
          color: flowerColors[Math.floor(Math.random() * flowerColors.length)] 
        });
        const flower = new THREE.Mesh(flowerGeometry, flowerMaterial);
        flower.position.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius);
        flower.userData.isHouse = true;
        scene.add(flower);
      }
    }

    // Fence
    if (props.hasFence) {
      const createFencePost = (x: number, z: number) => {
        const postGeometry = new THREE.BoxGeometry(0.1, 1, 0.1);
        const postMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(x, 0.5, z);
        post.userData.isHouse = true;
        scene.add(post);
      };

      // Front fence
      for (let i = -6; i <= 6; i += 2) {
        createFencePost(i, 6);
      }
      // Back fence
      for (let i = -6; i <= 6; i += 2) {
        createFencePost(i, -6);
      }
      // Side fences
      for (let i = -6; i <= 6; i += 2) {
        createFencePost(-6, i);
        createFencePost(6, i);
      }
    }

    // Trees
    for (let i = 0; i < props.treeCount; i++) {
      const angle = (i / props.treeCount) * Math.PI * 2;
      const radius = 7 + Math.random() * 3;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      const trunkHeight = 0.8 + Math.random() * 0.6;
      const trunkGeometry = new THREE.CylinderGeometry(0.15, 0.2, trunkHeight);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.set(x, trunkHeight / 2, z);
      trunk.castShadow = true;
      trunk.userData.isHouse = true;
      scene.add(trunk);

      const leavesSize = 0.6 + Math.random() * 0.4;
      const leavesGeometry = new THREE.SphereGeometry(leavesSize, 8, 6);
      const leavesColors = [0x228b22, 0x32cd32, 0x90ee90, 0x006400];
      const leavesMaterial = new THREE.MeshLambertMaterial({ 
        color: leavesColors[Math.floor(Math.random() * leavesColors.length)] 
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.set(x, trunkHeight + leavesSize * 0.7, z);
      leaves.castShadow = true;
      leaves.userData.isHouse = true;
      scene.add(leaves);
    }
  };

  const generateNewHouse = () => {
    setIsGenerating(true);
    const newProps = generateRandomHouse();
    setHouseProps(newProps);
    
    if (sceneRef.current) {
      buildHouse(sceneRef.current, newProps);
    }
    
    toast.success('🏠 New house generated!', {
      duration: 2000,
    });
    
    setTimeout(() => setIsGenerating(false), 500);
  };

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb); // Sky blue background
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(15, 15, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    scene.add(directionalLight);

    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(40, 40);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3cb371 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Generate initial house
    const initialProps = generateRandomHouse();
    setHouseProps(initialProps);
    buildHouse(scene, initialProps);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Slowly rotate camera around the house
      const time = Date.now() * 0.0005;
      camera.position.x = Math.cos(time) * 12;
      camera.position.z = Math.sin(time) * 12;
      camera.lookAt(0, 0, 0);

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
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏠 3D House Visualization</h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="bg-orange-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                🚧 BETA FEATURE
              </span>
              <span className="text-gray-400">|</span>
              <span className="text-gray-400">Experimental 3D house generator</span>
            </div>
            <p className="text-gray-400">Generate unique 3D houses with randomized properties</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 text-center">
          <button
            onClick={generateNewHouse}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-3 rounded-lg transition-colors font-bold disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </>
            ) : (
              <>
                🎲 Generate New House
              </>
            )}
          </button>
          <p className="text-gray-500 text-sm mt-2">
            Click to generate a new house with random properties!
          </p>
        </div>

        {/* 3D Scene Container */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-100 mb-2">Interactive 3D House Model</h2>
            <p className="text-gray-400 text-sm mb-4">
              🎯 This beta feature generates unique houses with randomized properties. 
              Camera automatically rotates around the house for a full 360° view.
            </p>
          </div>
          
          <div 
            ref={mountRef} 
            className="w-full h-96 bg-gradient-to-b from-blue-200 to-green-200"
            style={{ minHeight: '500px' }}
          />
        </div>

        {/* House Properties */}
        {houseProps && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-100 mb-4">🏗️ Current House Properties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-blue-400 font-bold">Dimensions</div>
                <div className="text-gray-300">
                  {houseProps.houseWidth.toFixed(1)} × {houseProps.houseDepth.toFixed(1)} × {houseProps.houseHeight.toFixed(1)}m
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-green-400 font-bold">Windows</div>
                <div className="text-gray-300">
                  {houseProps.windowType} • {houseProps.windowSize.toFixed(1)}m
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-yellow-400 font-bold">Door</div>
                <div className="text-gray-300">
                  {houseProps.doorWidth.toFixed(1)} × {houseProps.doorHeight.toFixed(1)}m
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-purple-400 font-bold">Roof</div>
                <div className="text-gray-300 capitalize">{houseProps.roofType}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-red-400 font-bold">Floors</div>
                <div className="text-gray-300">{houseProps.hasSecondFloor ? '2 floors' : '1 floor'}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-cyan-400 font-bold">Garage</div>
                <div className="text-gray-300">{houseProps.hasGarage ? `Yes (${houseProps.garageSize.toFixed(1)}m)` : 'No'}</div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-orange-400 font-bold">Features</div>
                <div className="text-gray-300">
                  {[
                    houseProps.hasBalcony && 'Balcony',
                    houseProps.hasChimney && 'Chimney',
                    houseProps.hasGarden && 'Garden',
                    houseProps.hasFence && 'Fence'
                  ].filter(Boolean).join(', ') || 'Basic'}
                </div>
              </div>
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="text-pink-400 font-bold">Landscape</div>
                <div className="text-gray-300">{houseProps.treeCount} trees</div>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">🎲 Randomized Features</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• House dimensions (2.5-4.5m)</li>
              <li>• Window styles (square/round/arched)</li>
              <li>• Door sizes (0.4-1.4m)</li>
              <li>• Roof types (peaked/flat/dome)</li>
              <li>• Second floor (50% chance)</li>
              <li>• Garage with varying sizes</li>
              <li>• Balcony and chimney options</li>
              <li>• Garden with colorful flowers</li>
              <li>• Fence around property</li>
              <li>• 2-5 trees with random colors</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">🚀 Beta Features</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• 📊 Over 1000+ unique combinations</li>
              <li>• 🎨 Dynamic colors and materials</li>
              <li>• 🔄 Auto-rotating camera view</li>
              <li>• 🌱 Procedural landscaping</li>
              <li>• 🏗️ Realistic house proportions</li>
              <li>• ☀️ Advanced lighting system</li>
              <li>• 🎯 Real-time 3D rendering</li>
              <li>• 📱 Responsive viewport</li>
            </ul>
          </div>
          
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-gray-100 mb-3">🔮 Coming Soon</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>• 🚪 Interactive room navigation</li>
              <li>• 👥 Member location indicators</li>
              <li>• 📋 Task location markers</li>
              <li>• 🎨 Custom color schemes</li>
              <li>• 💾 Save favorite designs</li>
              <li>• 🏡 Interior room layouts</li>
              <li>• 🌦️ Weather effects</li>
              <li>• 🌅 Day/night cycle</li>
            </ul>
          </div>
        </div>

        {/* Beta Warning */}
        <div className="mt-8 bg-orange-900/20 border border-orange-600/50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h4 className="text-orange-400 font-bold mb-2">Beta Feature Notice</h4>
              <p className="text-gray-300 text-sm">
                This 3D house visualization is currently in beta. Features may change, and performance 
                may vary depending on your device. We&apos;re actively working on improvements and new features. 
                Your feedback is valuable - let us know what you&apos;d like to see next!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 