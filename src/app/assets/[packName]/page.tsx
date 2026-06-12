import { getModelsInPackage } from "@/lib/assets";
import AssetViewerClient from "./AssetViewerClient";
import Link from "next/link";
import { Suspense } from "react";

export default async function PackageViewerPage({ params }: { params: Promise<{ packName: string }> }) {
  const { packName } = await params;
  const decodedPackName = decodeURIComponent(packName);
  
  // Lấy ra tất cả các file model trong folder
  const { models, fallbackTextureUrl } = getModelsInPackage(decodedPackName);

  return (
    <div className="w-screen h-screen overflow-hidden relative bg-sky-100">
      {/* HUD tĩnh nằm đè lên trên */}
      <div className="absolute top-4 left-4 z-10">
        <Link href="/assets" className="px-5 py-2.5 bg-slate-800/90 backdrop-blur-md text-white font-medium rounded-xl hover:bg-slate-700 transition-colors shadow-lg border border-slate-600 flex items-center gap-2">
          <span className="text-xl leading-none">←</span> Back to Packages
        </Link>
      </div>
      
      <div className="absolute top-4 right-4 z-10 bg-slate-900/90 backdrop-blur-md text-white px-6 py-3 rounded-xl shadow-lg border border-slate-600">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 font-bold">Current Package</div>
        <div className="text-lg font-bold text-sky-400">{decodedPackName}</div>
        <div className="text-sm text-slate-300 mt-1">{models.length} assets loaded</div>
      </div>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-slate-900/80 backdrop-blur-sm text-white px-6 py-2 rounded-full shadow-lg border border-slate-600/50 text-sm flex gap-6">
        <span>🖱️ Drag to pan</span>
        <span>🔍 Scroll to zoom</span>
      </div>

      {/* R3F Canvas */}
      <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-xl font-bold text-slate-600">Loading scene...</div>}>
        <AssetViewerClient models={models} fallbackTextureUrl={fallbackTextureUrl} />
      </Suspense>
    </div>
  );
}
