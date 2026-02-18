import { supabase } from './supabase.js'

const OSM_URL = `https://overpass.kumi.systems/api/interpreter?data=[out:json];area["ISO3166-1"="SE"]->.sweden;(node["leisure"="sauna"](area.sweden);way["leisure"="sauna"](area.sweden););out center;`

async function importeraOSM() {
  console.log('Hämtar från OSM...')
  
  const response = await fetch(OSM_URL)
  const data = await response.json()
  
  console.log(`Hittade ${data.elements.length} bastur från OSM`)
  
  const bastuar = data.elements
    .filter(b => b.tags && b.tags.name) // bara de med namn
    .map(b => ({
      name: b.tags.name,
      lat: b.lat || b.center?.lat,
      lon: b.lon || b.center?.lon,
      fee: b.tags.fee || null,
      opening_hours: b.tags.opening_hours || null,
      website: b.tags.website || null,
      osm_id: b.id
    }))
  
  console.log(`Importerar ${bastuar.length} bastur till Supabase...`)
  
  const { data: inserted, error } = await supabase
    .from('bastuar')
    .insert(bastuar)
  
  if (error) {
    console.error('Fel vid import:', error)
  } else {
    console.log('Import klar!', inserted)
  }
}

importeraOSM()