export default function AnuncioCard({ titulo, descripcion, bannerUrl }) {
  return (
    <div className="comunidad-anuncio-card">
      {bannerUrl ? (
        <img src={bannerUrl} alt={titulo} className="comunidad-anuncio-banner" />
      ) : (
        <>
          <h3>{titulo}</h3>
          <p>{descripcion}</p>
        </>
      )}
    </div>
  );
}