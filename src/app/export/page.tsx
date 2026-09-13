"use client";

import React, { useState, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF, Environment, Bounds } from "@react-three/drei";

const ModelRenderer = ({ modelPath, onRendered }: { modelPath: string; onRendered: (url: string) => void }) => {
  const { scene } = useGLTF(modelPath);
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
    } catch {
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
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Batch Flower Card Generator</h1>
      <p className="text-gray-600 mb-6">
        Render models to 2D transparent PNGs for 2D card displays.
      </p>

      <div className="flex gap-4 items-center mb-6">
        <button 
          onClick={handleStart} 
          disabled={isExporting || files.length === 0}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {isExporting ? `Exporting (${currentIndex + 1}/${files.length})...` : "Start Batch Export"}
        </button>
        <span className="text-sm text-gray-500">
          Found {files.length} flowers
        </span>
      </div>

      <div className="relative w-96 h-96 border rounded-xl overflow-hidden bg-gradient-to-tr from-gray-200 to-white shadow-inner">
        <Canvas 
          gl={{ preserveDrawingBuffer: true, alpha: true }}
          camera={{ position: [0, 1, 2.5], fov: 45 }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} />
          <directionalLight position={[-5, 5, -5]} intensity={1} color="#bbf" />
          <Environment preset="park" />
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
