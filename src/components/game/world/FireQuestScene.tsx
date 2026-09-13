"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Sparkles } from "@react-three/drei";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import type { GLTF } from "three-stdlib";
import { GAME_ASSETS } from "@/constants/assets";
import { scaleToHeight } from "@/constants/assetScale";
import { FIRE_QUEST_SCENE, type BurningTreeConfig } from "@/config/world/chapter1";
import { riverCenterlineDistance } from "@/utils/worldSampling";
import { useFireQuestStore } from "@/store/useFireQuestStore";
import { playerRadar } from "./CompassRadar";

/**
 * Incendie de forêt : trois arbres en flammes, la berge où l'on puise, et le
 * seau qu'Alex porte. Tout le "quoi faire" vit dans `useFireQuestStore` — ici
 * il n'y a que le rendu et les sondes de proximité.
 *
 * Les flammes sont des cônes en `AdditiveBlending` plutôt qu'un système de
 * particules : à la distance de la caméra isométrique une poignée de cônes qui
 * vacillent lit mieux (et coûte bien moins) qu'un vrai billboard de feu, et ça
 * reste dans le style low-poly du reste de la forêt.
 */

const BUCKET_MODEL = GAME_ASSETS.MODELS.DECORATION.PROPS_BUCKET_WATER;

/** Durée de la bouffée de vapeur après extinction d'un arbre. */
const STEAM_DURATION_MS = 2600;

/** Une langue de feu : base (x, y, z), rayon, hauteur, déphasage, couleur. */
interface FlameTongue {
  x: number;
  y: number;
  z: number;
  radius: number;
  height: number;
  phase: number;
  color: string;
}

/**
 * Les flammes restent DÉLIBÉRÉMENT plus basses que l'arbre (la plus haute
 * culmine vers 0,75 × la hauteur) et assez fines pour qu'on lise encore la
 * silhouette du tronc à travers : « quelques arbres avec des flammes », pas
 * une colonne de feu qui avale l'arbre.
 */
function buildTongues(treeHeight: number): FlameTongue[] {
  const spread = treeHeight / 8;
  return [
    { x: 0, y: 0, z: 0, radius: 1.0 * spread, height: 2.9 * spread, phase: 0, color: "#ff3d00" },
    { x: 0.75 * spread, y: 0, z: 0.4 * spread, radius: 0.55 * spread, height: 1.9 * spread, phase: 1.3, color: "#ff6d00" },
    { x: -0.7 * spread, y: 0, z: -0.45 * spread, radius: 0.5 * spread, height: 1.7 * spread, phase: 2.6, color: "#ff5100" },
    { x: 0.15 * spread, y: treeHeight * 0.3, z: -0.15 * spread, radius: 0.5 * spread, height: 1.8 * spread, phase: 3.4, color: "#ff4d00" },
    { x: -0.2 * spread, y: treeHeight * 0.55, z: 0.2 * spread, radius: 0.42 * spread, height: 1.5 * spread, phase: 4.8, color: "#ff8f1f" },
  ];
}

function TreeFlames({ treeHeight }: { treeHeight: number }) {
  const tongues = useMemo(() => buildTongues(treeHeight), [treeHeight]);
  const groups = useRef<(THREE.Group | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    for (let i = 0; i < groups.current.length; i++) {
      const g = groups.current[i];
      if (!g) continue;
      const phase = tongues[i].phase;
      // Deux sinus de périodes incommensurables : le vacillement ne retombe
      // jamais sur un cycle visible, contrairement à un seul sin().
      const stretch = 0.84 + Math.sin(t * 6 + phase) * 0.13 + Math.sin(t * 11.3 + phase * 2) * 0.06;
      g.scale.set(1, stretch, 1);
      g.rotation.y = Math.sin(t * 2 + phase) * 0.3;
    }
  });

  return (
    <group>
      {tongues.map((tongue, i) => (
        <group
          key={i}
          ref={(el) => {
            groups.current[i] = el;
          }}
          position={[tongue.x, tongue.y, tongue.z]}
        >
          {/* Enveloppe orange — transparence NORMALE, pas additive : en additif
              sur le tronc sombre la flamme vire au crème et perd toute couleur. */}
          <mesh position={[0, tongue.height / 2, 0]}>
            <coneGeometry args={[tongue.radius, tongue.height, 8]} />
            <meshBasicMaterial color={tongue.color} transparent opacity={0.82} depthWrite={false} />
          </mesh>
          {/* Cœur incandescent — additif, c'est lui qui donne la lueur. */}
          <mesh position={[0, tongue.height * 0.34, 0]} scale={[0.42, 0.58, 0.42]}>
            <coneGeometry args={[tongue.radius, tongue.height, 8]} />
            <meshBasicMaterial
              color="#ffd24a"
              transparent
              opacity={0.7}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      ))}

      {/* Braises et fumée */}
      <Sparkles count={26} scale={[3, treeHeight, 3]} position={[0, treeHeight * 0.5, 0]} size={5} speed={0.8} noise={0.5} color="#ffb347" />
      <Sparkles count={16} scale={[4, 4, 4]} position={[0, treeHeight + 1.5, 0]} size={13} speed={0.25} noise={0.3} color="#6b6b6b" opacity={0.35} />
    </group>
  );
}

function BurningTree({ tree, index }: { tree: BurningTreeConfig; index: number }) {
  const { scene } = useGLTF(tree.modelPath) as GLTF;
  const scale = scaleToHeight(tree.modelPath, tree.targetHeight);

  /**
   * Deux réparations en un seul passage, matériau par matériau :
   *
   * 1. Le pack `quaternius_raw_glb` sort de la conversion FBX avec des
   *    matériaux à `opacity: 0` — les arbres sont bien dans la scène, à la
   *    bonne échelle, mais parfaitement invisibles. Le visualiseur de modèles
   *    (`src/app/models/[packName]/ModelItem.tsx`) applique déjà exactement ce
   *    correctif.
   * 2. On assombrit vers le brun-charbon : ce sont des arbres qui brûlent, et
   *    un tronc calciné garde du sens une fois le feu éteint.
   *
   * `scene.clone()` PARTAGE les matériaux avec le cache de `useGLTF` : sans
   * `material.clone()`, teinter ces arbres teinterait aussi le tronc couché de
   * `arrival_fallen_tree` et toute la végétation qui réutilise ce modèle.
   */
  const cloned = useMemo(() => {
    const copy = scene.clone();
    copy.traverse((node) => {
      const mesh = node as THREE.Mesh;
      if (!mesh.isMesh) return;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      mesh.material = materials.map((source) => {
        const material = (source as THREE.MeshStandardMaterial).clone();
        material.transparent = false;
        material.opacity = 1;
        material.color.multiplyScalar(0.45);
        return material;
      });
      if (!Array.isArray(mesh.material)) return;
      if (mesh.material.length === 1) mesh.material = mesh.material[0];
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    });
    return copy;
  }, [scene]);

  const out = useFireQuestStore((s) => s.extinguished[index]);
  const setNearTree = useFireQuestStore((s) => s.setNearTree);

  // Bouffée de vapeur juste après l'extinction — le feedback "ça a marché"
  // doit être visible dans le monde 3D, pas seulement dans le HUD.
  //
  // Horodatage en ref + `visible` piloté dans useFrame, plutôt qu'un
  // setState/timeout : un état React qui s'éteint tout seul 2,6 s plus tard
  // relancerait un rendu de l'arbre pour rien (et déclenche la règle
  // react-hooks/set-state-in-effect).
  const steamRef = useRef<THREE.Group>(null);
  const outSince = useRef<number | null>(null);

  useFrame(() => {
    if (outSince.current === null && useFireQuestStore.getState().extinguished[index]) {
      outSince.current = performance.now();
    }
    if (!steamRef.current) return;
    steamRef.current.visible =
      outSince.current !== null && performance.now() - outSince.current < STEAM_DURATION_MS;
  });

  // Le chunk ne démonte jamais cette scène, mais HMR / changement de route si :
  // sans ce nettoyage l'invite « Verser l'eau » resterait collée à l'écran.
  useEffect(
    () => () => {
      if (useFireQuestStore.getState().nearTree === index) setNearTree(null);
    },
    [index, setNearTree],
  );

  return (
    <group position={[tree.position[0], 0, tree.position[1]]}>
      <RigidBody type="fixed" colliders={false}>
        <CylinderCollider args={[2, 0.6]} position={[0, 2, 0]} />
        <group scale={scale} rotation={[0, tree.rotationY, 0]}>
          <primitive object={cloned} castShadow receiveShadow />
        </group>
      </RigidBody>

      {!out && <TreeFlames treeHeight={tree.targetHeight} />}
      {out && (
        <group ref={steamRef}>
          <Sparkles count={30} scale={[3.5, 4, 3.5]} position={[0, 2, 0]} size={16} speed={0.5} noise={0.4} color="#dfe9ef" opacity={0.5} />
        </group>
      )}

      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        position={[0, 1, 0]}
        onIntersectionEnter={() => setNearTree(index)}
        onIntersectionExit={() => {
          if (useFireQuestStore.getState().nearTree === index) setNearTree(null);
        }}
      >
        <CylinderCollider args={[3, FIRE_QUEST_SCENE.treeRadius]} />
      </RigidBody>
    </group>
  );
}

/**
 * « Suis-je au bord de la rivière ? » — mesuré sur l'axe échantillonné plutôt
 * qu'avec un capteur posé à un endroit précis, pour qu'Alex puisse puiser
 * n'importe où le long du cours d'eau, comme on s'y attend.
 *
 * Un frame sur six suffit : à 5 m/s le joueur parcourt 0,5 m entre deux
 * mesures, négligeable face au seuil de 12 m. Le store n'est écrit que sur
 * changement d'état (règle « pas de setState par frame », AGENTS.md §5.3).
 */
function WaterEdgeProbe() {
  const tick = useRef(0);

  useFrame(() => {
    const store = useFireQuestStore.getState();
    if (store.phase !== "fighting") {
      if (store.nearWater) store.setNearWater(false);
      return;
    }
    if (++tick.current % 6 !== 0) return;

    const near = riverCenterlineDistance(playerRadar.x, playerRadar.z) <= FIRE_QUEST_SCENE.waterReach;
    if (near !== store.nearWater) store.setNearWater(near);
  });

  return null;
}

/** Seau plein qui flotte au-dessus d'Alex tant qu'il porte de l'eau. */
function CarriedBucket() {
  const hasWater = useFireQuestStore((s) => s.hasWater);
  const { scene } = useGLTF(BUCKET_MODEL) as GLTF;
  const cloned = useMemo(() => scene.clone(), [scene]);
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.position.set(playerRadar.x, 2.3 + Math.sin(t * 2.5) * 0.12, playerRadar.z);
    ref.current.rotation.y = t * 0.8;
  });

  if (!hasWater) return null;

  return (
    <group ref={ref} scale={scaleToHeight(BUCKET_MODEL, 0.6)}>
      <primitive object={cloned} />
    </group>
  );
}

export default function FireQuestScene() {
  const setNearFire = useFireQuestStore((s) => s.setNearFire);
  const { center, discoverRadius, trees } = FIRE_QUEST_SCENE;

  const anyBurning = useFireQuestStore((s) => s.extinguished.some((out) => !out));
  const lightRef = useRef<THREE.PointLight>(null);

  // Une seule lumière pour toute la clairière : trois point lights dynamiques
  // renchérissent chaque matériau de la scène, alors qu'à cette échelle l'œil
  // ne distingue pas trois foyers d'un seul.
  useFrame(({ clock }) => {
    if (!lightRef.current) return;
    const target = anyBurning ? 3.2 + Math.sin(clock.elapsedTime * 13) * 0.4 : 0;
    lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, target, 0.1);
  });

  useEffect(() => () => setNearFire(false), [setNearFire]);

  return (
    <group>
      {trees.map((tree, i) => (
        <BurningTree key={tree.id} tree={tree} index={i} />
      ))}

      <pointLight
        ref={lightRef}
        position={[center[0], 4, center[1]]}
        color="#ff8a3d"
        intensity={3.2}
        distance={40}
        decay={2}
      />

      <WaterEdgeProbe />
      <CarriedBucket />

      <RigidBody
        type="fixed"
        colliders={false}
        sensor
        position={[center[0], 1, center[1]]}
        onIntersectionEnter={() => setNearFire(true)}
        onIntersectionExit={() => setNearFire(false)}
      >
        <CylinderCollider args={[4, discoverRadius]} />
      </RigidBody>
    </group>
  );
}

FIRE_QUEST_SCENE.trees.forEach((t) => useGLTF.preload(t.modelPath));
useGLTF.preload(BUCKET_MODEL);
