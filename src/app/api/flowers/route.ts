import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  const directoryPath = path.join(process.cwd(), 'public/models/flowers');
  
  try {
    const files = fs.readdirSync(directoryPath);
    const glbFiles = files.filter(file => file.endsWith('.glb'));
    return NextResponse.json({ files: glbFiles });
  } catch (error) {
    return NextResponse.json({ error: 'Unable to scan directory' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { filename, image } = await req.json();
    const base64Data = image.replace(/^data:image\/png;base64,/, "");
    
    const outDir = path.join(process.cwd(), 'public/assets/flowers_2d');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outDir, filename), base64Data, 'base64');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
