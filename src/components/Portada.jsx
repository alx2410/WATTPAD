import AnimatedText from "./AnimatedText";

export default function Portada() {
  return (
    <div style={{ position: "relative" }}>
      <img 
        src="/portada.jpg"
        alt="portada"
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          borderRadius: "0 0 20px 20px"
        }}
      />

      {/* Texto animado y buscador encima */}
      <div 
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          textAlign: "center"
        }}
      >
        <AnimatedText 
          frases={[
            "Historias que te atrapan",
            "Lectores como tú",
            "Un mundo de imaginación"
          ]}
        />

        <input
          type="text"
          placeholder="Buscar historias..."
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "12px 15px",
            fontSize: "16px",
            borderRadius: "15px",
            border: "none",
            outline: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)"
          }}
        />
      </div>
    </div>
  );
}
