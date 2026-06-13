"use client";

import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Bounds } from "@react-three/drei";
import * as THREE from "three";

const ModelRenderer = ({ modelPath, onRendered }: { modelPath: string; onRendered: (url: string) => void }) => {
  const { scene } = useGLTF(modelPath) as any;
  const { gl, scene: threeScene, camera } = useThree();
  
  useEffect(() => {
    if (!modelPath || modelPath.includes('undefined')) return;
    
    const timer = setTimeout(() => {
      // Force an explicit render to clear out old buffers
      gl.clear();
      gl.render(threeScene, camera);
      const dataUrl = gl.domElement.toDataURL("image/png");
      onRendered(dataUrl);
    }, 1500);

    return () => clearTimeout(timer);
  }, [modelPath, gl, threeScene, camera, onRendered]);

  return (
    <Bounds fit clip observe margin={1.2}>
      <primitive object={scene} />
    </Bounds>
  );
};

export default function ExportPage() {
  const [files, setFiles] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<Record<string, string>>({});
  const [isExporting, setIsExporting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/flowers')
      .then(res => res.json())
      .then(data => {
        if (data.files) setFiles(data.files);
      });
  }, []);

  const handleStart = () => {
    setIsExporting(true);
    setCurrentIndex(0);
    setImages({});
    setLogs([]);
  };

  const handleRendered = async (dataUrl: string) => {
    const filename = files[currentIndex].replace('.glb', '.png');
    setImages(prev => ({ ...prev, [filename]: dataUrl }));
    
    try {
      await fetch('/api/flowers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, image: dataUrl })
      });
      setLogs(prev => [...prev, `Saved ${filename}`]);
    } catch (e) {
      setLogs(prev => [...prev, `Failed to save ${filename}`]);
    }

    if (currentIndex < files.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsExporting(false);
      setLogs(prev => [...prev, "All done! Check public/assets/flowers_2d"]);
    }
  };

  return (
    <div className="p-8 font-sans bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Export 3D Flowers to 2D PNG</h1>
      <p className="mb-4 text-gray-600">This tool will render all flowers in public/models/flowers and save them as PNGs in public/assets/flowers_2d.</p>
      
      {!isExporting && currentIndex === 0 && (
        <button 
          onClick={handleStart}
          className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700"
        >
          Start Export ({files.length} files)
        </button>
      )}

      {isExporting && (
        <div className="mb-4">
          <p className="font-bold text-lg text-blue-600">Processing {currentIndex + 1} of {files.length}...</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${((currentIndex + 1) / files.length) * 100}%` }}></div>
          </div>
        </div>
      )}

        <div style={{ width: 512, height: 512, position: 'absolute', top: -2000, left: -2000 }}>
          <Canvas 
            gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true, toneMappingExposure: 1.0 }} 
            camera={{ position: [4, 3, 4], fov: 40 }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, -5]} intensity={1.5} />
            <directionalLight position={[-5, 5, 5]} intensity={0.5} color="#abcdef" />
            <Environment preset="city" environmentIntensity={0.6} />
            <React.Suspense fallback={null}>
              <ModelRenderer 
                key={files[currentIndex]} 
                modelPath={`/models/flowers/${files[currentIndex]}`} 
                onRendered={handleRendered} 
              />
            </React.Suspense>
          </Canvas>
        </div>

      <div className="mt-8 grid grid-cols-6 gap-4">
        {Object.entries(images).map(([file, url]) => (
          <div key={file} className="border bg-white p-2 rounded shadow-sm text-center">
            <img src={url} alt={file} className="w-full h-auto mb-2 bg-gray-100 rounded" />
            <span className="text-xs text-gray-500 break-words">{file}</span>
          </div>
        ))}
      </div>

      {logs.length > 0 && (
        <div className="mt-8 bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-40 overflow-y-auto">
          {logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
