import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useState } from "react";
import VRScene from "./VRScene";

interface VRCanvasProps {
  onExit: () => void;
}

export default function VRCanvas({ onExit }: VRCanvasProps) {
  const [store] = useState(() => createXRStore());

  useEffect(() => {
    // Enter VR session when component mounts
    store.enterVR();

    // Handle session end
    const unsubscribe = store.subscribe((state) => {
      // When session ends, exit VR mode
      if (state.session === null) {
        onExit();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [store, onExit]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas
        gl={{
          // Request WebGL2 context for better performance
          powerPreference: "high-performance",
          antialias: true,
          alpha: false,
        }}
        camera={{
          position: [0, 1.6, 0], // Average eye height
          fov: 75,
        }}
      >
        <XR store={store}>
          <VRScene />
        </XR>
      </Canvas>
    </div>
  );
}
