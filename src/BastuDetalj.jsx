import './BastuDetalj.css'

export default function BastuDetalj({ bastu, onStäng }) {
      console.log('Bastu data:', bastu) // ← LÄGG TILL
  return (
    <div className="modal-backdrop" onClick={onStäng}>
      <div className="detalj-innehall" onClick={e => e.stopPropagation()}>
        <button className="stäng-knapp" onClick={onStäng}>✕</button>
        
        <h1>{bastu.name}</h1>
        {bastu.stad && <p className="stad-stor">📍 {bastu.stad}</p>}
        
        <div className="detalj-sektion">
          <h3>Information</h3>
          {bastu.fee ? (
            <p><strong>Avgift:</strong> {bastu.fee}</p>
          ) : (
            <p className="saknas-info">Avgift: information saknas</p>
          )}
          
          {bastu.opening_hours ? (
            <p><strong>Öppettider:</strong> {bastu.opening_hours}</p>
          ) : (
            <p className="saknas-info">Öppettider: information saknas</p>
          )}
          
          {bastu.website && (
            <p><strong>Webbplats:</strong> <a href={bastu.website} target="_blank" rel="noopener noreferrer">{bastu.website}</a></p>
          )}
        </div>

       {(bastu.address || (bastu.lat && bastu.lon)) && (
  <div className="detalj-sektion">
    <h3>Plats</h3>
    {bastu.address && <p><strong>Adress:</strong> {bastu.address}</p>}
    {bastu.lat && bastu.lon && (
      <>
        <p><strong>Koordinater:</strong> {bastu.lat.toFixed(4)}, {bastu.lon.toFixed(4)}</p>
        <a 
          href={`https://www.google.com/maps?q=${bastu.lat},${bastu.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="karta-länk"
        >
          🗺️ Öppna i Google Maps
        </a>
      </>
    )}
  </div>
)}
      </div>
    </div>
  )
}