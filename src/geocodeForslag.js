import { supabase } from './supabaseNode.js'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function geocodeAddress(address) {
  try {
    await delay(1000) // Vänta 1 sekund (Nominatim rate limit)
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Sverige')}&format=json&limit=1`,
      { headers: { 'User-Agent': 'Bastufinnaren/1.0' } }
    )
    const data = await response.json()
    
    if (data.length > 0) {
      const lat = parseFloat(data[0].lat)
      const lon = parseFloat(data[0].lon)
      
      // Kolla att det är inom Sverige
      if (lat > 55 && lat < 70 && lon > 10 && lon < 25) {
        return { lat, lon }
      }
    }
    return null
  } catch (err) {
    console.error('Geocoding-fel:', err)
    return null
  }
}

async function main() {
  console.log('Hämtar godkända förslag utan koordinater...')
  
  const { data: forslag, error } = await supabase
    .from('bastuar_forslag')
    .select('id, name, address')
    .eq('status', 'approved')
    .is('lat', null)
  
  if (error) {
    console.error('Fel:', error)
    return
  }
  
  if (!forslag || forslag.length === 0) {
    console.log('Inga förslag att geocoda!')
    return
  }
  
  console.log(`Hittade ${forslag.length} förslag att geocoda\n`)
  
  let lyckade = 0
  let misslyckade = 0
  
  for (let i = 0; i < forslag.length; i++) {
    const f = forslag[i]
    console.log(`[${i+1}/${forslag.length}] ${f.name}`)
    console.log(`  Adress: ${f.address}`)
    
    const coords = await geocodeAddress(f.address)
    
    if (coords) {
      const { error: updateError } = await supabase
        .from('bastuar_forslag')
        .update({ 
          lat: coords.lat, 
          lon: coords.lon 
        })
        .eq('id', f.id)
      
      if (updateError) {
        console.log(`  ❌ Fel vid sparande: ${updateError.message}`)
        misslyckade++
      } else {
        console.log(`  ✅ ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`)
        lyckade++
      }
    } else {
      console.log(`  ⚠️  Kunde inte hitta koordinater`)
      misslyckade++
    }
  }
  
  console.log(`\n✨ Klart!`)
  console.log(`Lyckade: ${lyckade}`)
  console.log(`Misslyckade: ${misslyckade}`)
}

main()