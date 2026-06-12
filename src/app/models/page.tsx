import { getAssetPackages } from "@/lib/assets";
import Link from "next/link";

export default function AssetsIndexPage() {
  const packages = getAssetPackages();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
        3D Assets Viewer
      </h1>
      <p className="text-center text-slate-400 mb-12 max-w-2xl mx-auto">
        Select a package below to view all its models laid out in a 3D isometric space.
      </p>
      
      {packages.length === 0 ? (
        <div className="text-center text-slate-500">
          No asset packages found in public/models.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {packages.map(pack => (
            <Link key={pack} href={`/models/${pack}`}>
              <div className="bg-slate-800 p-6 rounded-2xl hover:bg-slate-700 transition-all duration-300 border border-slate-700 hover:border-sky-500 shadow-lg hover:shadow-sky-500/20 cursor-pointer h-full flex flex-col justify-center items-center text-center">
                <div className="text-4xl mb-4">📦</div>
                <h2 className="text-xl font-semibold break-words w-full">{pack}</h2>
                <div className="mt-4 text-sm text-sky-400 font-medium">Click to view</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
