import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FaCompress, FaExpand } from "react-icons/fa";

// 4 Real Kitabxana Zonası
export const LIBRARY_ZONES = [
  { 
    id: "window", 
    name: "Pəncərə Önü Masalar", 
    color: 0x10b981, 
    hex: "#10b981", 
    label: "A Sektoru (A-01 - A-04)", 
    amenities: ["🪟 Panoramik Pəncərə İşığı", "⚡ 220V Rozetka", "💡 Günəş Şüası", "📶 Wi-Fi 6 (1 Gbps)"] 
  },
  { 
    id: "silent", 
    name: "Mərkəzi Səssiz Oxu Zalı", 
    color: 0x8b5cf6, 
    hex: "#8b5cf6", 
    label: "B Sektoru (B-01 - B-12)", 
    amenities: ["🔕 100% Mütləq Səssizlik", "💡 Qədimi Banker Masa Lampası", "⚡ Fərdi Rozetka", "📚 Kitab Altlığı"] 
  },
  { 
    id: "digital", 
    name: "Kompüter İş Stansiyaları", 
    color: 0x0284c7, 
    hex: "#0284c7", 
    label: "C Sektoru (C-01 - C-06)", 
    amenities: ["🖥️ 27\" 4K Monitor", "⚡ Type-C 100W Fast Charge", "🎧 Səs İzolyasiyalı Qulaqlıq", "📶 Fiber Şəbəkə"] 
  },
  { 
    id: "pod", 
    name: "Fərdi Tədqiqat Kabinələri", 
    color: 0xf59e0b, 
    hex: "#f59e0b", 
    label: "D Sektoru (D-01 - D-04)", 
    amenities: ["🚪 Akustik Səs Keçirməyən Arakəsmə", "🛋️ Erqonomik Kreslo", "🌡️ Fərdi İşıq & Havalandırma", "⚡ 220V Rozetka"] 
  }
];

const OCCUPIED_COLOR = 0x94a3b8; // Soft grey for occupied
const SELECTED_COLOR = 0xf59e0b; // Amber / Golden for active user selection
const MINE_COLOR = 0xec4899;     // Pink / Magenta for user's own confirmed reservation

const Library3DHall = ({ 
  selectedSeat, 
  onSelectSeat, 
  confirmedBookings = [], 
  myBookings = [],
  selectedDate = "",
  selectedSlot = null 
}) => {
  const mountRef = useRef(null);
  const containerRef = useRef(null);

  const [is2D, setIs2D] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

  // Three.js References
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const interactiveObjectsRef = useRef([]);
  const animFrameIdRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Web Audio click feedback
  const playClickSound = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // səssiz
    }
  }, []);

  // Update seat colors & markers based on real-time bookings
  const updateSeatColors = useCallback(() => {
    if (!interactiveObjectsRef.current) return;

    interactiveObjectsRef.current.forEach((obj) => {
      const meta = obj.userData;
      if (!meta) return;

      const isMine = myBookings.some(
        (b) =>
          b.status === "Confirmed" &&
          (b.roomOrSeatNumber?.includes(meta.id) || b.roomOrSeatNumber?.includes(meta.name)) &&
          b.bookingDate?.split("T")[0] === selectedDate
      );

      const isOccupied = confirmedBookings.some(
        (b) =>
          b.status === "Confirmed" &&
          (b.roomOrSeatNumber?.includes(meta.id) || b.roomOrSeatNumber?.includes(meta.name)) &&
          (!selectedSlot || b.startTime?.slice(0, 5) === selectedSlot.start || !b.startTime)
      );

      const isSelected = selectedSeat?.id === meta.id;

      meta.isOccupied = isOccupied;
      meta.isMine = isMine;
      meta.isSelected = isSelected;

      let color = meta.defaultColor;
      let emissive = 0x000000;
      let emissiveIntensity = 0;

      if (isMine) {
        color = MINE_COLOR;
        emissive = 0xec4899;
        emissiveIntensity = 0.45;
      } else if (isSelected) {
        color = SELECTED_COLOR;
        emissive = 0xf59e0b;
        emissiveIntensity = 0.65;
      } else if (isOccupied) {
        color = OCCUPIED_COLOR;
      }

      if (obj.material) {
        obj.material.color.setHex(color);
        if (obj.material.emissive) {
          obj.material.emissive.setHex(emissive);
          obj.material.emissiveIntensity = emissiveIntensity;
        }
      }

      // Also update desk marker ring if attached
      if (meta.markerRing && meta.markerRing.material) {
        meta.markerRing.material.color.setHex(color);
        meta.markerRing.visible = isSelected || isMine || !isOccupied;
      }
    });
  }, [confirmedBookings, myBookings, selectedSeat, selectedDate, selectedSlot]);

  useEffect(() => {
    updateSeatColors();
  }, [updateSeatColors]);

  // Build the 3D Library Room Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 980;
    const height = container.clientHeight || 580;

    // 1. SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x131720); // Dark elegant collegiate atmosphere
    scene.fog = new THREE.FogExp2(0x131720, 0.015);
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5, 15);
    cameraRef.current = camera;

    // 3. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.replaceChildren(renderer.domElement);
    rendererRef.current = renderer;

    // 4. ORBIT CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.2, 0);
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.minPolarAngle = Math.PI / 8;
    controls.minDistance = 6;
    controls.maxDistance = 22;
    controlsRef.current = controls;

    // 5. LIGHTING (Warm Academic Library Illumination)
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2);
    scene.add(ambientLight);

    // Warm Sun streaming through west arched windows
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.8);
    sunLight.position.set(-14, 12, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // Soft overhead room downlight
    const roomDownLight = new THREE.PointLight(0xffecd2, 1.5, 25);
    roomDownLight.position.set(0, 7, 0);
    scene.add(roomDownLight);

    // 6. ROOM ARCHITECTURE (Floor, Walls, Ceiling)
    // Floor: Warm Herringbone Hardwood Parquet
    const floorGeo = new THREE.PlaneGeometry(24, 20);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x8b5a36,
      roughness: 0.35,
      metalness: 0.08
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Baseboards / Trims
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.6 });
    const trimBack = new THREE.Mesh(new THREE.BoxGeometry(24, 0.4, 0.1), trimMat);
    trimBack.position.set(0, 0.2, -10);
    scene.add(trimBack);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.85 });
    
    // North Back Wall
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 6.5, 0.4), wallMat);
    backWall.position.set(0, 3.25, -10.2);
    scene.add(backWall);

    // East Wall (Right)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.5, 20), wallMat);
    rightWall.position.set(12.2, 3.25, 0);
    scene.add(rightWall);

    // West Wall with Large Arched Library Windows (Left)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6.5, 20), wallMat);
    leftWall.position.set(-12.2, 3.25, 0);
    scene.add(leftWall);

    // 3 Large Luminous Panoramic Windows along the West Wall
    const windowGlassMat = new THREE.MeshBasicMaterial({ color: 0xdbeafe });
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });

    for (let z = -6; z <= 6; z += 6) {
      // Window glass
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 4.2), windowGlassMat);
      glass.position.set(-12.0, 3.4, z);
      glass.rotation.y = Math.PI / 2;
      scene.add(glass);

      // Window Frame Arch
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.4, 3.2), windowFrameMat);
      frame.position.set(-12.0, 3.4, z);
      scene.add(frame);

      // Soft sun glow from window
      const winLight = new THREE.PointLight(0xfff7ed, 0.9, 12);
      winLight.position.set(-11.5, 3.8, z);
      scene.add(winLight);
    }

    // 7. BOOKSHELVES (Tall Wooden Bookshelves filled with rows of books)
    const shelfWoodMat = new THREE.MeshStandardMaterial({ color: 0x4a2e1b, roughness: 0.65 });
    const bookColors = [0x7b2d4a, 0x1e3a5f, 0x1b4332, 0x854d0e, 0x3f3f46, 0xb91c1c, 0x1e293b, 0xca8a04];

    const createBookshelf = (posX, posY, posZ, rotY = 0) => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(posX, posY, posZ);
      shelfGroup.rotation.y = rotY;

      // Outer frame
      const frame = new THREE.Mesh(new THREE.BoxGeometry(4.2, 5.0, 0.6), shelfWoodMat);
      frame.position.y = 2.5;
      frame.castShadow = true;
      shelfGroup.add(frame);

      // 4 Shelf levels with multi-colored books
      for (let s = 1; s <= 4; s++) {
        const shelfY = s * 1.1;
        // Shelf plank
        const plank = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.08, 0.55), shelfWoodMat);
        plank.position.set(0, shelfY, 0.05);
        shelfGroup.add(plank);

        // Books on shelf
        for (let b = -1.8; b <= 1.8; b += 0.16) {
          const bookHeight = 0.55 + Math.sin(b * 5) * 0.12;
          const bookColor = bookColors[Math.floor(Math.abs(Math.sin(b * 12)) * bookColors.length)];
          const bookMat = new THREE.MeshStandardMaterial({ color: bookColor, roughness: 0.5 });
          const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, bookHeight, 0.42), bookMat);
          bookMesh.position.set(b, shelfY + bookHeight / 2 + 0.04, 0.06);
          shelfGroup.add(bookMesh);
        }
      }
      scene.add(shelfGroup);
    };

    // Place bookshelves along North Wall and East Wall
    createBookshelf(-7.5, 0, -9.8, 0);
    createBookshelf(-2.5, 0, -9.8, 0);
    createBookshelf(2.5, 0, -9.8, 0);
    createBookshelf(7.5, 0, -9.8, 0);
    createBookshelf(11.8, 0, -5.0, -Math.PI / 2);
    createBookshelf(11.8, 0, 5.0, -Math.PI / 2);

    // 8. LIBRARY STUDY DESKS & STATIONS (4 ZONES)
    const interactiveObjects = [];

    // Reusable Materials
    const tableWoodMat = new THREE.MeshStandardMaterial({ color: 0x9c6644, roughness: 0.35, metalness: 0.05 });
    const legMetalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });
    const lampGreenMat = new THREE.MeshStandardMaterial({ color: 0x1e3a2b, roughness: 0.3 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.7 });

    // Helper: Create an interactive library study seat
    const createLibrarySeat = (seatId, seatName, zoneObj, posX, posY, posZ, facingAngle) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(posX, posY, posZ);
      seatGroup.rotation.y = facingAngle;

      // Chair cushion (interactive target)
      const cushionMat = new THREE.MeshStandardMaterial({
        color: zoneObj.color,
        roughness: 0.5,
        metalness: 0.1
      });
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.52), cushionMat);
      cushion.position.set(0, 0.48, 0);
      cushion.castShadow = true;
      seatGroup.add(cushion);

      // Chair Backrest with wooden slats
      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.08), cushionMat);
      backrest.position.set(0, 0.76, -0.22);
      backrest.castShadow = true;
      seatGroup.add(backrest);

      // Chair Legs
      const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.45, 8);
      for (const lx of [-0.22, 0.22]) {
        for (const lz of [-0.2, 0.2]) {
          const leg = new THREE.Mesh(chairLegGeo, legMetalMat);
          leg.position.set(lx, 0.225, lz);
          seatGroup.add(leg);
        }
      }

      // Glowing selection marker ring on the floor
      const ringGeo = new THREE.RingGeometry(0.35, 0.42, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: zoneObj.color, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.02, 0);
      seatGroup.add(ring);

      // Metadata for raycasting
      cushion.userData = {
        id: seatId,
        name: seatName,
        zoneId: zoneObj.id,
        zoneName: zoneObj.name,
        amenities: zoneObj.amenities,
        defaultColor: zoneObj.color,
        markerRing: ring,
        seatGroup: seatGroup
      };

      scene.add(seatGroup);
      interactiveObjects.push(cushion);
    };

    // Helper: Classic Green Banker's Desk Lamp with glowing bulb
    const createDeskLamp = (x, y, z) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(x, y, z);

      // Brass base & stem
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 16), brassMat);
      lampGroup.add(base);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), brassMat);
      stem.position.y = 0.18;
      lampGroup.add(stem);

      // Curved Emerald Glass Shade
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.12, 16, 1, false, 0, Math.PI), lampGreenMat);
      shade.rotation.x = Math.PI / 2;
      shade.position.set(0, 0.35, 0);
      lampGroup.add(shade);

      // Subtle warm reading light glow
      const lampLight = new THREE.PointLight(0xffecc4, 0.45, 2.5);
      lampLight.position.set(0, 0.28, 0);
      lampGroup.add(lampLight);

      scene.add(lampGroup);
    };

    // --- ZONE A: Pəncərə Önü Tədqiqat Masaları (Along West Window Wall) ---
    const zoneA = LIBRARY_ZONES[0];
    for (let i = 0; i < 4; i++) {
      const deskZ = -4.5 + i * 3.0;
      const deskX = -9.2;
      const deskId = `A-0${i + 1}`;

      // Wooden study table
      const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.0), tableWoodMat);
      table.position.set(deskX, 0.74, deskZ);
      table.castShadow = true;
      scene.add(table);

      // Table legs
      for (const tx of [-0.7, 0.7]) {
        for (const tz of [-0.4, 0.4]) {
          const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), legMetalMat);
          tLeg.position.set(deskX + tx, 0.36, deskZ + tz);
          scene.add(tLeg);
        }
      }

      // Lamp & open book on desk
      createDeskLamp(deskX - 0.45, 0.78, deskZ);
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.25), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      book.position.set(deskX, 0.8, deskZ);
      scene.add(book);

      // Interactive Chair facing the window
      createLibrarySeat(deskId, `Masa ${deskId} • Pəncərə Önü`, zoneA, deskX + 0.85, 0, deskZ, -Math.PI / 2);
    }

    // --- ZONE B: Mərkəzi Səssiz Oxu Zalı (2 Large Shared Mahogany Library Tables) ---
    const zoneB = LIBRARY_ZONES[1];

    const createSharedTable = (centerX, centerZ, startSeatIndex) => {
      // Large Table Top (seats 6 people, 3 on each side)
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 2.2), tableWoodMat);
      table.position.set(centerX, 0.75, centerZ);
      table.castShadow = true;
      scene.add(table);

      // Table Legs
      for (const tx of [-2.4, 0, 2.4]) {
        for (const tz of [-0.95, 0.95]) {
          const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), legMetalMat);
          tLeg.position.set(centerX + tx, 0.36, centerZ + tz);
          scene.add(tLeg);
        }
      }

      // Center Divider Partition
      const divider = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.28, 0.04), new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.5 }));
      divider.position.set(centerX, 0.92, centerZ);
      scene.add(divider);

      // 3 seats on North side, 3 seats on South side
      const offsets = [-1.7, 0, 1.7];
      let sIdx = startSeatIndex;

      // North side (facing South)
      offsets.forEach((offX) => {
        const sNum = sIdx < 10 ? `0${sIdx}` : `${sIdx}`;
        const seatId = `B-${sNum}`;
        createLibrarySeat(seatId, `Mərkəzi Zalı • Masa ${seatId}`, zoneB, centerX + offX, 0, centerZ - 1.45, 0);
        createDeskLamp(centerX + offX, 0.8, centerZ - 0.25);
        sIdx++;
      });

      // South side (facing North)
      offsets.forEach((offX) => {
        const sNum = sIdx < 10 ? `0${sIdx}` : `${sIdx}`;
        const seatId = `B-${sNum}`;
        createLibrarySeat(seatId, `Mərkəzi Zalı • Masa ${seatId}`, zoneB, centerX + offX, 0, centerZ + 1.45, Math.PI);
        createDeskLamp(centerX + offX, 0.8, centerZ + 0.25);
        sIdx++;
      });
    };

    createSharedTable(-1.0, -3.5, 1);  // Desks B-01 to B-06
    createSharedTable(-1.0, 3.5, 7);   // Desks B-07 to B-12

    // --- ZONE C: Rəqəmsal Kompüter Laboratoriyası (Northeast Workstations) ---
    const zoneC = LIBRARY_ZONES[2];
    const compTable = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 1.1), tableWoodMat);
    compTable.position.set(7.5, 0.74, -4.5);
    scene.add(compTable);

    // 3 iMac Workstations facing North
    for (let c = 0; c < 3; c++) {
      const cx = 5.8 + c * 1.7;
      const seatId = `C-0${c + 1}`;

      // iMac Monitor
      const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.03), screenMat);
      screen.position.set(cx, 1.05, -4.8);
      scene.add(screen);

      // Monitor Stand
      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), legMetalMat);
      stand.position.set(cx, 0.85, -4.8);
      scene.add(stand);

      // Screen glow
      const glow = new THREE.PointLight(0x38bdf8, 0.4, 1.5);
      glow.position.set(cx, 1.05, -4.6);
      scene.add(glow);

      createLibrarySeat(seatId, `Kompüter Workstation • ${seatId}`, zoneC, cx, 0, -3.6, Math.PI);
    }

    // 3 iMac Workstations facing South
    const compTable2 = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 1.1), tableWoodMat);
    compTable2.position.set(7.5, 0.74, -1.8);
    scene.add(compTable2);

    for (let c = 0; c < 3; c++) {
      const cx = 5.8 + c * 1.7;
      const seatId = `C-0${c + 4}`;

      const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.03), screenMat);
      screen.position.set(cx, 1.05, -1.5);
      scene.add(screen);

      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), legMetalMat);
      stand.position.set(cx, 0.85, -1.5);
      scene.add(stand);

      createLibrarySeat(seatId, `Kompüter Workstation • ${seatId}`, zoneC, cx, 0, -2.7, 0);
    }

    // --- ZONE D: Fərdi Akustik Kabinələr (Southeast Private Study Pods) ---
    const zoneD = LIBRARY_ZONES[3];
    const podWallMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });

    for (let p = 0; p < 4; p++) {
      const px = 5.8 + (p % 2) * 2.8;
      const pz = 3.2 + Math.floor(p / 2) * 2.8;
      const seatId = `D-0${p + 1}`;

      // Acoustic booth surround (3 walls)
      const bBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.08), podWallMat);
      bBack.position.set(px, 0.9, pz - 0.9);
      scene.add(bBack);

      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 1.8), podWallMat);
      bLeft.position.set(px - 0.9, 0.9, pz);
      scene.add(bLeft);

      const bRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 1.8), podWallMat);
      bRight.position.set(px + 0.9, 0.9, pz);
      scene.add(bRight);

      // Desk inside pod
      const pDesk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), tableWoodMat);
      pDesk.position.set(px, 0.74, pz - 0.4);
      scene.add(pDesk);

      // LED reading strip light inside pod
      const podLight = new THREE.PointLight(0xfff5ea, 0.55, 2.5);
      podLight.position.set(px, 1.6, pz - 0.4);
      scene.add(podLight);

      createLibrarySeat(seatId, `Fərdi Tədqiqat Kabinəsi • ${seatId}`, zoneD, px, 0, pz + 0.35, Math.PI);
    }

    interactiveObjectsRef.current = interactiveObjects;
    updateSeatColors();

    // 9. ANIMATION LOOP
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 10. RESIZE
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth || 980;
      const h = mountRef.current.clientHeight || 580;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Raycasting for Mouse Hover & Click
  const handlePointerMove = (e) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(interactiveObjectsRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const meta = hit.userData;
      if (meta) {
        setHoveredSeat(meta);
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top - 14,
          visible: true
        });
        document.body.style.cursor = meta.isOccupied ? "not-allowed" : "pointer";
        return;
      }
    }

    setTooltipPos((prev) => ({ ...prev, visible: false }));
    document.body.style.cursor = "default";
  };

  const handlePointerDown = () => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(interactiveObjectsRef.current);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const meta = hit.userData;
      if (meta) {
        if (meta.isOccupied) return;
        playClickSound();
        if (onSelectSeat) {
          onSelectSeat({
            id: meta.id,
            name: meta.name,
            zone: meta.zoneName,
            amenities: meta.amenities,
            image: meta.zoneId === "window" 
              ? "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=600&q=80"
              : meta.zoneId === "digital"
              ? "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
              : meta.zoneId === "pod"
              ? "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80"
          });
        }
      }
    }
  };

  // 2D Floorplan / 3D Perspective Toggle
  const toggle2D = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!is2D) {
      // 2D Architectural Floorplan from above
      camera.position.set(0, 18.5, 0.1);
      controls.target.set(0, 0, 0);
      controls.maxPolarAngle = 0.05;
      controls.minPolarAngle = 0;
      setIs2D(true);
    } else {
      // 3D Perspective inside the library hall
      camera.position.set(0, 8.5, 15);
      controls.target.set(0, 1.2, 0);
      controls.maxPolarAngle = Math.PI / 2.1;
      controls.minPolarAngle = Math.PI / 8;
      setIs2D(false);
    }
    controls.update();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "100vh" : "580px",
        borderRadius: isFullscreen ? "0" : "24px",
        overflow: "hidden",
        backgroundColor: "#131720",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ width: "100%", height: "100%" }}
      />

      {/* TOP FLOATING LEGEND PILL (Exact match to iTicket style adapted for Library) */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "30px",
          padding: "5px 12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
          zIndex: 10,
          maxWidth: "94vw",
          overflowX: "auto"
        }}
      >
        {LIBRARY_ZONES.map((zone) => (
          <div
            key={zone.id}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              background: "#f1f5f9",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "#1e293b",
              whiteSpace: "nowrap"
            }}
          >
            <span
              style={{
                width: "9px",
                height: "9px",
                borderRadius: "50%",
                backgroundColor: zone.hex,
                display: "inline-block"
              }}
            />
            {zone.name}
          </div>
        ))}

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "20px",
            background: "#f1f5f9",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: "#64748b",
            whiteSpace: "nowrap"
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              borderRadius: "50%",
              backgroundColor: "#94a3b8",
              display: "inline-block"
            }}
          />
          Məşğul / Dolu
        </div>
      </div>

      {/* TOP RIGHT FULLSCREEN BUTTON */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Pəncərəyə qayıt" : "Tam ekran rejimi"}
        style={{
          position: "absolute",
          top: "16px",
          right: "18px",
          width: "40px",
          height: "40px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1e293b",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
          zIndex: 10
        }}
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
      </button>

      {/* RIGHT SIDE FLOATING ROUND 2D / 3D TOGGLE BUTTON */}
      <button
        onClick={toggle2D}
        title={is2D ? "3D Perspektivə keç" : "2D Sxemə keç"}
        style={{
          position: "absolute",
          top: "50%",
          right: "22px",
          transform: "translateY(-50%)",
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          background: "#FFFFFF",
          color: "#1e293b",
          border: "2px solid #e2e8f0",
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.92rem",
          fontWeight: 800,
          cursor: "pointer",
          zIndex: 10,
          transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}
      >
        {is2D ? "3D" : "2D"}
      </button>

      {/* BOTTOM ROOM BANNER */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(0, 0, 0, 0.65)",
          backdropFilter: "blur(8px)",
          color: "#f6c177",
          padding: "6px 18px",
          borderRadius: "20px",
          fontSize: "0.78rem",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 10,
          border: "1px solid rgba(246, 193, 119, 0.3)"
        }}
      >
        📚 AKADEMİK OXU ZALI VƏ RƏQƏMSAL TƏDQİQAT MƏRKƏZİ
      </div>

      {/* FLOATING 3D HOVER TOOLTIP */}
      {tooltipPos.visible && hoveredSeat && (
        <div
          style={{
            position: "absolute",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
            background: "rgba(15, 23, 42, 0.94)",
            backdropFilter: "blur(10px)",
            color: "#ffffff",
            padding: "8px 14px",
            borderRadius: "12px",
            fontSize: "0.82rem",
            pointerEvents: "none",
            zIndex: 20,
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.15)",
            whiteSpace: "nowrap",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#f6c177", marginBottom: "2px" }}>
            {hoveredSeat.id} • {hoveredSeat.name}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
            {hoveredSeat.zoneName}
          </div>
          <div style={{ fontSize: "0.76rem", fontWeight: 700, marginTop: "4px", color: hoveredSeat.isOccupied ? "#f87171" : "#34d399" }}>
            {hoveredSeat.isOccupied ? "● Məşğuldur (Dolu)" : "✓ Boşdur • Seçmək üçün klikləyin"}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library3DHall;
