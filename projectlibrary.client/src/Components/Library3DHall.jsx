import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { 
  FaCompress, 
  FaExpand, 
  FaLandmark, 
  FaSun, 
  FaVolumeMute, 
  FaDesktop, 
  FaDoorClosed,
  FaCheck,
  FaTimes
} from "react-icons/fa";

// 4 Real Kitabxana Zonası
export const LIBRARY_ZONES = [
  { 
    id: "window", 
    name: "Pəncərə Önü Masalar", 
    color: 0x10b981, 
    hex: "#10b981", 
    label: "A Sektoru (A-01 - A-04)", 
    amenities: ["Panoramik Pəncərə İşığı", "220V Rozetka", "Təbii Günəş İşığı", "Wi-Fi 6 (1 Gbps)"] 
  },
  { 
    id: "silent", 
    name: "Mərkəzi Səssiz Oxu Zalı", 
    color: 0x8b5cf6, 
    hex: "#8b5cf6", 
    label: "B Sektoru (B-01 - B-12)", 
    amenities: ["Mütləq Səssizlik Rejimi", "Klassik Banker Masa Lampası", "Fərdi Elektrik Rozetkası", "Taxta Kitab Altlığı"] 
  },
  { 
    id: "digital", 
    name: "Kompüter İş Stansiyaları", 
    color: 0x0284c7, 
    hex: "#0284c7", 
    label: "C Sektoru (C-01 - C-06)", 
    amenities: ["27 düym 4K Monitor", "Type-C 100W Fast Charge", "Səs İzolyasiyalı Qulaqlıq", "Fiber Optik Şəbəkə"] 
  },
  { 
    id: "pod", 
    name: "Fərdi Tədqiqat Kabinələri", 
    color: 0xf59e0b, 
    hex: "#f59e0b", 
    label: "D Sektoru (D-01 - D-04)", 
    amenities: ["Akustik Səs Keçirməyən Arakəsmə", "Erqonomik Dəri Kreslo", "Fərdi İşıq və Havalandırma", "220V Rozetka"] 
  }
];

const OCCUPIED_COLOR = 0x94a3b8;
const SELECTED_COLOR = 0xf59e0b;
const MINE_COLOR = 0xec4899;

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
      osc.frequency.setValueAtTime(659.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
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

  // Update seat colors based on status
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

      if (meta.markerRing && meta.markerRing.material) {
        meta.markerRing.material.color.setHex(color);
        meta.markerRing.visible = isSelected || isMine || !isOccupied;
      }
    });
  }, [confirmedBookings, myBookings, selectedSeat, selectedDate, selectedSlot]);

  useEffect(() => {
    updateSeatColors();
  }, [updateSeatColors]);

  // Build the 3D Open Academic Library Hall Stage (Diorama)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 980;
    const height = container.clientHeight || 580;

    // 1. SCENE (Açıq, aydın, duman və tavan məhdudiyyəti olmadan)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x161d2b); // Dərin akademik tünd fon (bozarmır)
    scene.fog = null; // DUMAN SİLİNDİ - fırladanda qətiyyən bozarmaz!
    sceneRef.current = scene;

    // 2. CAMERA
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.8, 15.0);
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

    // 4. ORBIT CONTROLS (Fırladanda divara və ya tavana dəymir, həmişə açıqdır)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 0.8, 0);
    controls.maxPolarAngle = Math.PI / 2.05; // Döşəmənin altına keçməyə imkan vermir
    controls.minPolarAngle = Math.PI / 24;  // Yuxarıdan tam baxışa imkan verir
    controls.minDistance = 5;
    controls.maxDistance = 26;
    controlsRef.current = controls;

    // 5. LIGHTING (İsti, canlı və təbii işıqlandırma)
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.4);
    scene.add(ambientLight);

    // Əsas Günəş İşığı (Pəncərə tərəfdən gəlir)
    const sunLight = new THREE.DirectionalLight(0xfff5df, 2.0);
    sunLight.position.set(-14, 14, 6);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // Qarşı tərəfdən yumşaq doldurucu işıq (kölgələrin qapqara olmaması üçün)
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fillLight.position.set(12, 10, -6);
    scene.add(fillLight);

    // Mərkəzi zal işığı
    const roomDownLight = new THREE.PointLight(0xffecc2, 1.3, 20);
    roomDownLight.position.set(0, 5.5, 0);
    scene.add(roomDownLight);

    // 6. ROOM ARCHITECTURE (AÇIQ MEMARLIQ: Ön və Tavan tam açıqdır, mane olmur)
    const roomW = 25;
    const roomL = 19;
    const wallH = 5.2;

    // Parket döşəmə - İsti təbii palıd
    const floorGeo = new THREE.PlaneGeometry(roomW, roomL);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x936037,
      roughness: 0.35,
      metalness: 0.05
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Mərkəzi Qırmızı-Qızılı Lüks Kitabxana Xalçası
    const carpetGeo = new THREE.PlaneGeometry(3.6, roomL - 0.5);
    const carpetMat = new THREE.MeshStandardMaterial({
      color: 0x7b1828,
      roughness: 0.85,
      metalness: 0.0
    });
    const carpet = new THREE.Mesh(carpetGeo, carpetMat);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.set(-0.8, 0.015, 0);
    carpet.receiveShadow = true;
    scene.add(carpet);

    // Xalçanın qızılı haşiyələri
    const borderMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.4, metalness: 0.6 });
    [-2.6, 1.0].forEach((bx) => {
      const border = new THREE.Mesh(new THREE.PlaneGeometry(0.08, roomL - 0.5), borderMat);
      border.rotation.x = -Math.PI / 2;
      border.position.set(bx, 0.018, 0);
      scene.add(border);
    });

    // Divar Materialları (İsti krem daş divar + qoz ağacı panellər)
    const wallPlasterMat = new THREE.MeshStandardMaterial({ color: 0xede4d5, roughness: 0.75 });
    const woodPanelMat = new THREE.MeshStandardMaterial({ color: 0x3d2012, roughness: 0.55 });
    const woodCrownMat = new THREE.MeshStandardMaterial({ color: 0x2b160b, roughness: 0.5 });

    // 1. ŞİMAL DİVARI (Arxa Divar - Kitab Rəfləri ilə Zənginləşdirilib)
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(roomW, wallH, 0.5), wallPlasterMat);
    backWall.position.set(0, wallH / 2, -roomL / 2);
    scene.add(backWall);

    const backWainscot = new THREE.Mesh(new THREE.BoxGeometry(roomW, 1.2, 0.6), woodPanelMat);
    backWainscot.position.set(0, 0.6, -roomL / 2);
    scene.add(backWainscot);

    // 2. QƏRB DİVARI (Sol Divar - Pəncərələr ilə Zənginləşdirilib)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallH, roomL), wallPlasterMat);
    leftWall.position.set(-roomW / 2, wallH / 2, 0);
    scene.add(leftWall);

    const leftWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, roomL), woodPanelMat);
    leftWainscot.position.set(-roomW / 2, 0.6, 0);
    scene.add(leftWainscot);

    // 3. ŞƏRQ DİVARI (Sağ Divar - Rəflər və Saat ilə Zənginləşdirilib)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, wallH, roomL), wallPlasterMat);
    rightWall.position.set(roomW / 2, wallH / 2, 0);
    scene.add(rightWall);

    const rightWainscot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, roomL), woodPanelMat);
    rightWainscot.position.set(roomW / 2, 0.6, 0);
    scene.add(rightWainscot);

    // QEYD: Ön tərəf (Cənub) və Tavan tamamilə açıqdır! Kamera fırlananda heç vaxt örtülmür və bozarmaz.

    // 7. QƏRB DİVARINDA PƏNCƏRƏLƏR VƏ TƏBİİ İŞIQ
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
    const windowGlassMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.2, metalness: 0.3 });

    for (let wz = -6.0; wz <= 6.0; wz += 4.0) {
      // Pəncərə Şüşəsi
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 3.2), windowGlassMat);
      glass.position.set(-roomW / 2 + 0.28, 3.0, wz);
      glass.rotation.y = Math.PI / 2;
      scene.add(glass);

      // Pəncərə Çərçivəsi
      const frame = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.4, 2.4), windowFrameMat);
      frame.position.set(-roomW / 2 + 0.26, 3.0, wz);
      scene.add(frame);

      // Pəncərə Arakəsmələri
      const vMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 3.2, 0.06), windowFrameMat);
      vMuntin.position.set(-roomW / 2 + 0.27, 3.0, wz);
      scene.add(vMuntin);

      const hMuntin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.06, 2.2), windowFrameMat);
      hMuntin.position.set(-roomW / 2 + 0.27, 3.0, wz);
      scene.add(hMuntin);

      // Pəncərə qarşısında isti günəş işığı
      const pLight = new THREE.PointLight(0xfff7e6, 0.7, 7);
      pLight.position.set(-roomW / 2 + 1.0, 3.0, wz);
      scene.add(pLight);
    }

    // 8. DİVARLAR BOYUNCA KİTAB RƏFLƏRİ
    const shelfWoodMat = new THREE.MeshStandardMaterial({ color: 0x422214, roughness: 0.55 });
    const bookColors = [
      0x881337, 0x1e3a8a, 0x14532d, 0x78350f, 0x312e81, 
      0x9a3412, 0x164e63, 0x701a75, 0xb45309, 0x1e293b
    ];

    const createBookcase = (posX, posY, posZ, width, height, rotY = 0) => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(posX, posY, posZ);
      shelfGroup.rotation.y = rotY;

      // Korpus
      const frame = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.6), shelfWoodMat);
      frame.position.y = height / 2;
      frame.castShadow = true;
      shelfGroup.add(frame);

      // Tac hissəsi
      const crown = new THREE.Mesh(new THREE.BoxGeometry(width + 0.15, 0.2, 0.68), woodCrownMat);
      crown.position.y = height + 0.1;
      shelfGroup.add(crown);

      // 4 səviyyə rəf
      const numShelves = 4;
      const step = height / (numShelves + 1);
      for (let s = 1; s <= numShelves; s++) {
        const sY = s * step;
        const plank = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, 0.07, 0.54), shelfWoodMat);
        plank.position.set(0, sY, 0.04);
        shelfGroup.add(plank);

        // Kitablar
        const halfW = (width - 0.4) / 2;
        for (let b = -halfW; b <= halfW; b += 0.14) {
          const bH = step * 0.75 + (Math.sin(b * 8) * 0.06);
          const bColor = bookColors[Math.floor(Math.abs(Math.sin(b * 13)) * bookColors.length)];
          const bMat = new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.45 });
          const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, bH, 0.44), bMat);
          bookMesh.position.set(b, sY + bH / 2 + 0.035, 0.05);
          shelfGroup.add(bookMesh);
        }
      }

      scene.add(shelfGroup);
    };

    // Şimal Divarı boyu Kitab Rəfləri (Arxa divar)
    createBookcase(-8.5, 0, -roomL / 2 + 0.35, 5.0, 4.4, 0);
    createBookcase(-3.0, 0, -roomL / 2 + 0.35, 5.0, 4.4, 0);
    createBookcase(3.0, 0, -roomL / 2 + 0.35, 5.0, 4.4, 0);
    createBookcase(8.5, 0, -roomL / 2 + 0.35, 5.0, 4.4, 0);

    // Şərq Divarı boyu Kitab Rəfləri (Sağ divar)
    createBookcase(roomW / 2 - 0.35, 0, -4.5, 4.6, 4.4, -Math.PI / 2);
    createBookcase(roomW / 2 - 0.35, 0, 4.5, 4.6, 4.4, -Math.PI / 2);

    // Şərq Divarının mərkəzində klassik qızılı kitabxana saatı
    const clockGroup = new THREE.Group();
    clockGroup.position.set(roomW / 2 - 0.5, 3.6, 0);
    clockGroup.rotation.y = -Math.PI / 2;
    const clockDial = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.08, 32), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    clockDial.rotation.x = Math.PI / 2;
    clockGroup.add(clockDial);
    const clockRing = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.06, 12, 32), borderMat);
    clockGroup.add(clockRing);
    scene.add(clockGroup);

    // Klassik Divar Çıraqları (Wall Sconces)
    const createWallSconce = (wx, wy, wz, rotY = 0) => {
      const sconce = new THREE.Group();
      sconce.position.set(wx, wy, wz);
      sconce.rotation.y = rotY;

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), borderMat);
      base.rotation.x = Math.PI / 2;
      sconce.add(base);

      const shade = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xfffae0, roughness: 0.3 }));
      shade.position.set(0, 0.08, 0.18);
      sconce.add(shade);

      const light = new THREE.PointLight(0xffe8b0, 0.45, 4);
      light.position.set(0, 0.04, 0.18);
      sconce.add(light);

      scene.add(sconce);
    };

    createWallSconce(roomW / 2 - 0.45, 2.8, -1.8, -Math.PI / 2);
    createWallSconce(roomW / 2 - 0.45, 2.8, 1.8, -Math.PI / 2);

    // 9. MASA VƏ KRESLO KOMPONENTLƏRİ (4 ZONA)
    const interactiveObjects = [];

    const tableWoodMat = new THREE.MeshStandardMaterial({ color: 0x61341c, roughness: 0.28, metalness: 0.05 });
    const legMetalMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.3 });
    const lampGreenMat = new THREE.MeshStandardMaterial({ color: 0x134e4a, roughness: 0.2 });
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.2, metalness: 0.75 });

    // İnteraktiv Kreslo
    const createLibrarySeat = (seatId, seatName, zoneObj, posX, posY, posZ, facingAngle) => {
      const seatGroup = new THREE.Group();
      seatGroup.position.set(posX, posY, posZ);
      seatGroup.rotation.y = facingAngle;

      const cushionMat = new THREE.MeshStandardMaterial({
        color: zoneObj.color,
        roughness: 0.5,
        metalness: 0.08
      });
      const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.52), cushionMat);
      cushion.position.set(0, 0.48, 0);
      cushion.castShadow = true;
      seatGroup.add(cushion);

      const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.48, 0.08), cushionMat);
      backrest.position.set(0, 0.76, -0.22);
      backrest.castShadow = true;
      seatGroup.add(backrest);

      const chairLegGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.45, 8);
      for (const lx of [-0.22, 0.22]) {
        for (const lz of [-0.2, 0.2]) {
          const leg = new THREE.Mesh(chairLegGeo, legMetalMat);
          leg.position.set(lx, 0.225, lz);
          seatGroup.add(leg);
        }
      }

      const ringGeo = new THREE.RingGeometry(0.35, 0.42, 24);
      const ringMat = new THREE.MeshBasicMaterial({ color: zoneObj.color, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(0, 0.02, 0);
      seatGroup.add(ring);

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

    // Klassik Yaşıl Banker Masa Lampası
    const createDeskLamp = (x, y, z) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(x, y, z);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 16), brassMat);
      lampGroup.add(base);

      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.35, 8), brassMat);
      stem.position.y = 0.18;
      lampGroup.add(stem);

      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.12, 16, 1, false, 0, Math.PI), lampGreenMat);
      shade.rotation.x = Math.PI / 2;
      shade.position.set(0, 0.35, 0);
      lampGroup.add(shade);

      const lampLight = new THREE.PointLight(0xffecc4, 0.5, 2.8);
      lampLight.position.set(0, 0.28, 0);
      lampGroup.add(lampLight);

      scene.add(lampGroup);
    };

    // --- ZONE A: Pəncərə Önü Tədqiqat Masaları (Qərb Divarı boyu) ---
    const zoneA = LIBRARY_ZONES[0];
    for (let i = 0; i < 4; i++) {
      const deskZ = -4.5 + i * 3.0;
      const deskX = -9.4;
      const deskId = `A-0${i + 1}`;

      const table = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 1.0), tableWoodMat);
      table.position.set(deskX, 0.74, deskZ);
      table.castShadow = true;
      scene.add(table);

      for (const tx of [-0.7, 0.7]) {
        for (const tz of [-0.4, 0.4]) {
          const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.72, 0.06), legMetalMat);
          tLeg.position.set(deskX + tx, 0.36, deskZ + tz);
          scene.add(tLeg);
        }
      }

      createDeskLamp(deskX - 0.45, 0.78, deskZ);
      const book = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.03, 0.25), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      book.position.set(deskX, 0.8, deskZ);
      scene.add(book);

      createLibrarySeat(deskId, `Masa ${deskId} • Pəncərə Önü`, zoneA, deskX + 0.85, 0, deskZ, -Math.PI / 2);
    }

    // --- ZONE B: Mərkəzi Səssiz Oxu Zalı (2 Böyük Klassik Qoz Masası) ---
    const zoneB = LIBRARY_ZONES[1];

    const createSharedTable = (centerX, centerZ, startSeatIndex) => {
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.1, 2.2), tableWoodMat);
      table.position.set(centerX, 0.75, centerZ);
      table.castShadow = true;
      scene.add(table);

      for (const tx of [-2.4, 0, 2.4]) {
        for (const tz of [-0.95, 0.95]) {
          const tLeg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.72, 0.08), legMetalMat);
          tLeg.position.set(centerX + tx, 0.36, centerZ + tz);
          scene.add(tLeg);
        }
      }

      const divider = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.28, 0.04), new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.5 }));
      divider.position.set(centerX, 0.92, centerZ);
      scene.add(divider);

      const offsets = [-1.7, 0, 1.7];
      let sIdx = startSeatIndex;

      offsets.forEach((offX) => {
        const sNum = sIdx < 10 ? `0${sIdx}` : `${sIdx}`;
        const seatId = `B-${sNum}`;
        createLibrarySeat(seatId, `Mərkəzi Zalı • Masa ${seatId}`, zoneB, centerX + offX, 0, centerZ - 1.45, 0);
        createDeskLamp(centerX + offX, 0.8, centerZ - 0.25);
        sIdx++;
      });

      offsets.forEach((offX) => {
        const sNum = sIdx < 10 ? `0${sIdx}` : `${sIdx}`;
        const seatId = `B-${sNum}`;
        createLibrarySeat(seatId, `Mərkəzi Zalı • Masa ${seatId}`, zoneB, centerX + offX, 0, centerZ + 1.45, Math.PI);
        createDeskLamp(centerX + offX, 0.8, centerZ + 0.25);
        sIdx++;
      });
    };

    createSharedTable(-1.0, -3.5, 1);
    createSharedTable(-1.0, 3.5, 7);

    // --- ZONE C: Rəqəmsal Kompüter Laboratoriyası (Şərq Stansiyaları) ---
    const zoneC = LIBRARY_ZONES[2];
    const compTable = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.08, 1.1), tableWoodMat);
    compTable.position.set(7.5, 0.74, -4.5);
    scene.add(compTable);

    for (let c = 0; c < 3; c++) {
      const cx = 5.8 + c * 1.7;
      const seatId = `C-0${c + 1}`;

      const screenMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 });
      const screen = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.03), screenMat);
      screen.position.set(cx, 1.05, -4.8);
      scene.add(screen);

      const stand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.12), legMetalMat);
      stand.position.set(cx, 0.85, -4.8);
      scene.add(stand);

      const glow = new THREE.PointLight(0x38bdf8, 0.4, 1.5);
      glow.position.set(cx, 1.05, -4.6);
      scene.add(glow);

      createLibrarySeat(seatId, `Kompüter Workstation • ${seatId}`, zoneC, cx, 0, -3.6, Math.PI);
    }

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

    // --- ZONE D: Fərdi Akustik Kabinələr (Cənub-Şərq Kabinələri) ---
    const zoneD = LIBRARY_ZONES[3];
    const podWallMat = new THREE.MeshStandardMaterial({ color: 0x2e384d, roughness: 0.65 });

    for (let p = 0; p < 4; p++) {
      const px = 5.8 + (p % 2) * 2.8;
      const pz = 3.2 + Math.floor(p / 2) * 2.8;
      const seatId = `D-0${p + 1}`;

      const bBack = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.8, 0.08), podWallMat);
      bBack.position.set(px, 0.9, pz - 0.9);
      scene.add(bBack);

      const bLeft = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 1.8), podWallMat);
      bLeft.position.set(px - 0.9, 0.9, pz);
      scene.add(bLeft);

      const bRight = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 1.8), podWallMat);
      bRight.position.set(px + 0.9, 0.9, pz);
      scene.add(bRight);

      const pDesk = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), tableWoodMat);
      pDesk.position.set(px, 0.74, pz - 0.4);
      scene.add(pDesk);

      const podLight = new THREE.PointLight(0xfff5ea, 0.55, 2.5);
      podLight.position.set(px, 1.6, pz - 0.4);
      scene.add(podLight);

      createLibrarySeat(seatId, `Fərdi Tədqiqat Kabinəsi • ${seatId}`, zoneD, px, 0, pz + 0.35, Math.PI);
    }

    interactiveObjectsRef.current = interactiveObjects;
    updateSeatColors();

    // 10. ANIMATION LOOP
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

    // 11. RESIZE HANDLER
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

  // Raycasting
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

  const toggle2D = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!is2D) {
      camera.position.set(0, 18, 0.1);
      controls.target.set(0, 0, 0);
      controls.maxPolarAngle = 0.05;
      controls.minPolarAngle = 0;
      setIs2D(true);
    } else {
      camera.position.set(0, 8.8, 15.0);
      controls.target.set(0, 0.8, 0);
      controls.maxPolarAngle = Math.PI / 2.05;
      controls.minPolarAngle = Math.PI / 24;
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

  const getZoneIcon = (id) => {
    switch (id) {
      case "window": return <FaSun size={12} color="#10b981" />;
      case "silent": return <FaVolumeMute size={12} color="#8b5cf6" />;
      case "digital": return <FaDesktop size={12} color="#0284c7" />;
      case "pod": return <FaDoorClosed size={12} color="#f59e0b" />;
      default: return null;
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isFullscreen ? "100vh" : "590px",
        borderRadius: isFullscreen ? "0" : "24px",
        overflow: "hidden",
        backgroundColor: "#161d2b",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1)"
      }}
    >
      {/* 3D WebGL Canvas */}
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        style={{ width: "100%", height: "100%" }}
      />

      {/* TOP FLOATING LEGEND PILL */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          borderRadius: "30px",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
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
              padding: "5px 12px",
              borderRadius: "20px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "#1e293b",
              whiteSpace: "nowrap"
            }}
          >
            {getZoneIcon(zone.id)}
            <span
              style={{
                width: "8px",
                height: "8px",
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
            padding: "5px 12px",
            borderRadius: "20px",
            background: "#f1f5f9",
            border: "1px solid #e2e8f0",
            fontSize: "0.8rem",
            fontWeight: 700,
            color: "#64748b",
            whiteSpace: "nowrap"
          }}
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#94a3b8",
              display: "inline-block"
            }}
          />
          Məşğul
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
          width: "42px",
          height: "42px",
          borderRadius: "12px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#1e293b",
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
          zIndex: 10
        }}
      >
        {isFullscreen ? <FaCompress /> : <FaExpand />}
      </button>

      {/* RIGHT SIDE FLOATING ROUND 2D / 3D TOGGLE BUTTON */}
      <button
        onClick={toggle2D}
        title={is2D ? "3D Perspektivə keç" : "2D Memarlıq sxeminə keç"}
        style={{
          position: "absolute",
          top: "50%",
          right: "22px",
          transform: "translateY(-50%)",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "#FFFFFF",
          color: "#1e293b",
          border: "2px solid #e2e8f0",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.25)",
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
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(10px)",
          color: "#7b2d4a",
          padding: "7px 20px",
          borderRadius: "20px",
          fontSize: "0.82rem",
          fontWeight: 800,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          pointerEvents: "none",
          zIndex: 10,
          border: "1px solid rgba(123, 45, 74, 0.2)",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}
      >
        <FaLandmark color="#d97706" />
        <span>Akademik Oxu Zalı və Rəqəmsal Tədqiqat Mərkəzi</span>
      </div>

      {/* FLOATING 3D HOVER TOOLTIP */}
      {tooltipPos.visible && hoveredSeat && (
        <div
          style={{
            position: "absolute",
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: "translate(-50%, -100%)",
            background: "rgba(15, 23, 42, 0.95)",
            backdropFilter: "blur(12px)",
            color: "#ffffff",
            padding: "10px 16px",
            borderRadius: "14px",
            fontSize: "0.84rem",
            pointerEvents: "none",
            zIndex: 20,
            boxShadow: "0 14px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.12)",
            whiteSpace: "nowrap",
            textAlign: "center"
          }}
        >
          <div style={{ fontWeight: 800, fontSize: "0.94rem", color: "#f6c177", marginBottom: "3px" }}>
            {hoveredSeat.id} • {hoveredSeat.name}
          </div>
          <div style={{ fontSize: "0.78rem", color: "#cbd5e1" }}>
            {hoveredSeat.zoneName}
          </div>
          <div style={{ 
            fontSize: "0.78rem", 
            fontWeight: 700, 
            marginTop: "6px", 
            color: hoveredSeat.isOccupied ? "#f87171" : "#34d399",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px"
          }}>
            {hoveredSeat.isOccupied ? (
              <>
                <FaTimes size={11} /> Məşğuldur
              </>
            ) : (
              <>
                <FaCheck size={11} /> Boşdur • Seçmək üçün klikləyin
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library3DHall;
