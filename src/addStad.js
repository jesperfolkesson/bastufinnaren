import { supabase } from './supabaseNode.js'

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getStad(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
  
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Bastufinnaren/1.0' }
    })
    const data = await response.json()
    
    // Försök hitta stad i ordning: city, town, village, municipality
    const stad = data.address?.city || 
                 data.address?.town || 
                 data.address?.village || 
                 data.address?.municipality || 
                 'Okänd ort'
    
    return stad
  } catch (err) {
    console.error('Fel vid reverse geocoding:', err)
    return 'Okänd ort'
  }
}

async function uppdateraStader() {
  console.log('Hämtar bastur från Supabase...')
  
  const { data: bastuar, error } = await supabase
    .from('bastuar')
    .select('id, name, lat, lon, stad')
  
  if (error) {
    console.error('Fel:', error)
    return
  }
  
  console.log(`Hittade ${bastuar.length} bastur`)
  
  for (let i = 0; i < bastuar.length; i++) {
    const bastu = bastuar[i]
    
    if (bastu.stad) {
      console.log(`${i+1}/${bastuar.length} - ${bastu.name}: redan har stad (${bastu.stad})`)
      continue
    }
    
    console.log(`${i+1}/${bastuar.length} - Hämtar stad för ${bastu.name}...`)
    
    const stad = await getStad(bastu.lat, bastu.lon)
    
    const { error: updateError } = await supabase
      .from('bastuar')
      .update({ stad })
      .eq('id', bastu.id)
    
    if (updateError) {
      console.error(`Fel vid uppdatering av ${bastu.name}:`, updateError)
    } else {
      console.log(`✓ ${bastu.name} → ${stad}`)
    }
    
    // Vänta 1 sekund mellan anrop (Nominatim rate limit)
    await delay(1000)
  }
  
  console.log('Klart!')
}

uppdateraStader()