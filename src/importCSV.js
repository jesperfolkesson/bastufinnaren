import { supabase } from './supabaseNode.js'
import fs from 'fs'

console.log('Skriptet startar...')

const stad = process.argv[2]

if (!stad) {
  console.error('❌ Du måste ange en stad!')
  console.log('Exempel: node src/importCSV.js stockholm')
  process.exit(1)
}

const CSV_FILE = 'src/bastuar_import.csv'

if (!fs.existsSync(CSV_FILE)) {
  console.error(`❌ Filen ${CSV_FILE} finns inte!`)
  process.exit(1)
}

function cleanText(text) {
  if (!text) return text
  
  // Ta bort alla brackets
  text = text.replace(/[\[\]]/g, '')
  
  // För URL:er - ta bara första ordet (innan mellanslag eller oai_citation)
  if (text.includes('http')) {
    text = text.split(' ')[0].split('?')[0]
  }
  
  return text.trim()
}

async function importCSV() {
  console.log(`📂 Läser ${CSV_FILE}...`)
  
  const csv = fs.readFileSync(CSV_FILE, 'utf-8')
  const lines = csv.split('\n').slice(1).filter(line => line.trim())
  
  console.log(`📊 Hittade ${lines.length} rader`)
  
  const bastuar = lines.map(line => {
    const [namn, adress, stad, avgift, oppettider, webbplats] = line.split('|')
    
    return {
        name: cleanText(namn?.trim()),           
        address: cleanText(adress?.trim()),      
        stad: cleanText(stad?.trim()),           
        fee: avgift?.trim() === 'Okänd' ? null : cleanText(avgift?.trim()),
        opening_hours: oppettider?.trim() === 'Okänd' ? null : cleanText(oppettider?.trim()),
        website: cleanText(webbplats?.trim())
    }
  })
  
  console.log(`⬆️  Importerar ${bastuar.length} bastur till Supabase...`)
  
  for (const bastu of bastuar) {
      console.log('Importerar:', JSON.stringify(bastu)) // ← LÄGG TILL DENNA

    const { error } = await supabase
      .from('bastuar_forslag')
      .insert([bastu])
    
    if (error) {
      console.error(`❌ ${bastu.name}: ${error.message}`)
    } else {
      console.log(`✅ ${bastu.name}`)
    }
  }
  
  console.log('🎉 Import klar! Gå till admin-vyn för att godkänna.')
}

importCSV()