import { Canvas, useFrame } from "@react-three/fiber";
import { motion } from "framer-motion";
import { useRef, useState } from "react";
import type { Mesh } from "three";

function CrystalMesh() {
  const mesh = useRef<Mesh>(null);
  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += 0.007;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.7) * 0.18;
    mesh.current.position.y = Math.sin(state.clock.elapsedTime) * 0.14;
  });

  return (
    <mesh ref={mesh} castShadow receiveShadow>
      <octahedronGeometry args={[2.15, 1]} />
      <meshPhysicalMaterial
        color="#D4AF37"
        metalness={0.25}
        roughness={0.08}
        transmission={0.58}
        thickness={1.1}
        clearcoat={1}
        clearcoatRoughness={0.05}
      />
    </mesh>
  );
}

export function CrystalStage({ interactive = false, className = "" }: { interactive?: boolean; className?: string }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  return (
    <div
      className={`relative h-[360px] w-full overflow-hidden md:h-[500px] ${className}`}
      onMouseMove={(event) => {
        if (!interactive) return;
        const rect = event.currentTarget.getBoundingClientRect();
        setTilt({ x: (event.clientY - rect.top - rect.height / 2) / 28, y: (event.clientX - rect.left - rect.width / 2) / 28 });
      }}
      onMouseLeave={() => setTilt({ x: 0, y: 0 })}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.18),transparent_42%),linear-gradient(180deg,transparent,rgba(10,10,10,0.75))]" />
      <motion.div animate={{ rotateX: tilt.x, rotateY: tilt.y }} transition={{ type: "spring", stiffness: 80, damping: 18 }} className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 6], fov: 42 }} dpr={[1, 1.8]}>
          <ambientLight intensity={0.5} />
          <pointLight position={[3, 3, 4]} intensity={4} color="#D4AF37" />
          <pointLight position={[-4, -2, 2]} intensity={1.4} color="#ffffff" />
          <CrystalMesh />
        </Canvas>
      </motion.div>
      <div className="pointer-events-none absolute inset-x-10 bottom-12 h-12 rounded-full bg-gold/15 blur-2xl" />
    </div>
  );
}
