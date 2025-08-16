// API Route für Contract-Loading
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Contract } from '@/types/contractTypes';
import { createEmptyContract } from '@/utils/emptyContract';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vertrkey = searchParams.get('vertrkey');
    
    if (!vertrkey) {
      // Kein vertrkey angegeben - gib leeren Contract zurück
      console.log('API: No vertrkey provided, returning empty contract');
      const emptyContract = createEmptyContract();
      return NextResponse.json(emptyContract);
    }
    
    // Konstruiere Filename basierend auf vertrkey
    const targetFile = `${vertrkey}.json`;
    const filePath = path.join(process.cwd(), 'src', 'data', targetFile);
    
    console.log(`API: Attempting to load contract file: ${targetFile}`);
    
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const contractData: Contract = JSON.parse(fileContent);
      console.log(`API: Successfully loaded contract data from: ${targetFile}`);
      return NextResponse.json(contractData);
    } else {
      // File nicht gefunden - gib leeren Contract zurück
      console.log(`API: Contract file not found: ${targetFile}, returning empty contract`);
      const emptyContract = createEmptyContract();
      return NextResponse.json(emptyContract);
    }
    
  } catch (error) {
    console.error('API: Error loading contract data:', error);
    // Bei Fehlern auch leeren Contract zurückgeben statt 500-Error
    console.log('API: Returning empty contract due to error');
    const emptyContract = createEmptyContract();
    return NextResponse.json(emptyContract);
  }
}