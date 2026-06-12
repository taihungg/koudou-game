import fs from 'fs';
import path from 'path';

export function getAssetPackages(): string[] {
  const assetsDir = path.join(process.cwd(), 'public', 'assets');
  if (!fs.existsSync(assetsDir)) return [];

  const entries = fs.readdirSync(assetsDir, { withFileTypes: true });
  return entries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

export function getModelsInPackage(packName: string): { models: string[], fallbackTextureUrl: string | null } {
  const packDir = path.join(process.cwd(), 'public', 'assets', packName);
  if (!fs.existsSync(packDir)) return { models: [], fallbackTextureUrl: null };

  const models: string[] = [];
  let fallbackTextureUrl: string | null = null;

  // Recursive walk
  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        const publicPath = fullPath.replace(path.join(process.cwd(), 'public'), '');
        const normalizedPublicPath = publicPath.split(path.sep).join('/');

        if (['.fbx', '.gltf', '.glb', '.obj', '.dae'].includes(ext)) {
          models.push(normalizedPublicPath);
        } else if (!fallbackTextureUrl && ['.png', '.jpg', '.jpeg'].includes(ext)) {
          fallbackTextureUrl = normalizedPublicPath;
        }
      }
    }
  }

  walk(packDir);
  return { models, fallbackTextureUrl };
}
