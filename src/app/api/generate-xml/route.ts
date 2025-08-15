import { NextRequest, NextResponse } from 'next/server';
import { ServiceABSEinarbeiterHelper } from '@/utils/ServiceABSEinarbeiterHelper';
import { FIELD_DEFINITIONS } from '@/constants/fieldConfig';

export async function POST(request: NextRequest) {
  try {
    const { fieldValues } = await request.json();

    if (!fieldValues) {
      return NextResponse.json({
        success: false,
        error: 'fieldValues required'
      }, { status: 400 });
    }

    // Aktualisiere FIELD_DEFINITIONS.echteEingabe basierend auf fieldValues
    FIELD_DEFINITIONS.forEach(field => {
      if (fieldValues[field.key] !== undefined) {
        field.echteEingabe = fieldValues[field.key];
      }
    });

    // Generiere XML (identisch mit KB-TH Seite)
    const xml = ServiceABSEinarbeiterHelper.erzeugeSendeXML(fieldValues);
    const formattedXml = ServiceABSEinarbeiterHelper.formatXML(xml);
    
    // Statistiken
    const fieldCount = ServiceABSEinarbeiterHelper.zaehleEingegebeneFelder(fieldValues);
    const summary = ServiceABSEinarbeiterHelper.erstelleZusammenfassung(fieldValues);

    return NextResponse.json({
      success: true,
      xml: formattedXml,
      statistics: {
        fieldCount,
        summary,
        xmlLength: xml.length
      }
    });

  } catch (error) {
    console.error('XML Generation API Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}