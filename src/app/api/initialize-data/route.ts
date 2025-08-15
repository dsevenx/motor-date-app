import { NextRequest, NextResponse } from 'next/server';
import { generateEchteEingabeValues, FIELD_DEFINITIONS } from '@/constants/fieldConfig';

export async function POST(request: NextRequest) {
  try {
    const { existingData = {} } = await request.json();

    // Generiere vollständige Feld-Initialisierung (identisch mit Web-Chat)
    const baseValues = generateEchteEingabeValues();
    const currentValues: Record<string, string> = {};

    // FIELD_DEFINITIONS durchgehen und aktuelle Werte sammeln (wie Web-Chat)
    FIELD_DEFINITIONS.forEach(field => {
      let value: any;
      
      // Prüfe existingData first, dann baseValues, dann defaultValue
      if (existingData[field.key] !== undefined) {
        value = existingData[field.key];
      } else if (baseValues[field.key] !== undefined) {
        value = baseValues[field.key];
      } else {
        value = field.defaultValue || '';
      }
      
      // Konvertiere zu String für Claude API
      if (typeof value === 'object') {
        currentValues[field.key] = JSON.stringify(value);
      } else {
        currentValues[field.key] = String(value);
      }
    });

    return NextResponse.json({
      success: true,
      currentValues,
      fieldCount: Object.keys(currentValues).length
    });

  } catch (error) {
    console.error('Initialize Data API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}