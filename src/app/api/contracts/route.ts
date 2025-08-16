// API Route für Contract-Loading
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Contract } from '@/types/contractTypes';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vertrkey = searchParams.get('vertrkey');
    
    // Default-File falls kein vertrkey angegeben
    const defaultFile = 'testContract_AS_ 5294945057.json';
    let targetFile = defaultFile;
    
    if (vertrkey) {
      // Konstruiere Filename basierend auf vertrkey
      targetFile = `${vertrkey}.json`;
    }
    
    console.log(`API: Attempting to load contract file: ${targetFile}`);
    
    // Versuche das gewünschte File zu laden
    const filePath = path.join(process.cwd(), 'src', 'data', targetFile);
    
    let contractData: Contract | null = null;
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      contractData = JSON.parse(fileContent);
      console.log(`API: Successfully loaded contract data from: ${targetFile}`);
    } else if (targetFile !== defaultFile) {
      // Fallback auf Default-File
      console.log(`API: File ${targetFile} not found, trying default: ${defaultFile}`);
      const defaultFilePath = path.join(process.cwd(), 'src', 'data', defaultFile);
      
      if (fs.existsSync(defaultFilePath)) {
        const fileContent = fs.readFileSync(defaultFilePath, 'utf-8');
        contractData = JSON.parse(fileContent);
        console.log(`API: Successfully loaded default contract data from: ${defaultFile}`);
      }
    }
    
    if (!contractData) {
      return NextResponse.json(
        { error: `Contract file not found: ${targetFile}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json(contractData);
    
  } catch (error) {
    console.error('API: Error loading contract data:', error);
    return NextResponse.json(
      { error: 'Internal server error loading contract data' },
      { status: 500 }
    );
  }
}