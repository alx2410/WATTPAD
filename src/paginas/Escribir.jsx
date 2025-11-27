// src/paginas/Escribir.jsx
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // ajusta ruta si es necesario
import { db, storage } from "../firebase/config"; // ajusta ruta si es necesario
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Escribir() {
  const { user } = useAuth();

  // Libro
  const [tituloLibro, setTituloLibro] = useState("");
  const [genero, setGenero] = useState("");
  const [portadaFile, setPortadaFile] = useState(null);
  const [portadaPreview, setPortadaPreview] = useState("");

  // Capítulos (local)
  const [capitulos, setCapitulos] = useState([]); // objetos con { id, titulo, contenido, musicaUrl, musicaFile, stickers:[{file,type,preview,uploadedUrl}], fecha, publishedId }
  const [editingIndex, setEditingIndex] = useState(-1);

  // Editor temporal (capítulo)
  const [capTitulo, setCapTitulo] = useState("");
  const [capContenido, setCapContenido] = useState("");
  const [capMusicaUrl, setCapMusicaUrl] = useState("");
  const [capMusicaFile, setCapMusicaFile] = useState(null);
  const [capStickers, setCapStickers] = useState([]); // { file, type, preview, uploadedUrl? }

  // UI y estado
  const [vistaPreview, setVistaPreview] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [libroDocId, setLibroDocId] = useState(null); // id en Firestore si fue publicado
  const [libroTerminado, setLibroTerminado] = useState(false);
  const filePortadaRef = useRef();

  // inject estilos (naranja suave + sombras) - igual que tu archivo largo
  useEffect(() => {
    const id = "escribir-styles-v2";
    if (document.getElementById(id)) return;
    const css = `
      .escribir-root{max-width:1200px;margin:30px auto;padding:22px;background:#fff;border-radius:14px;box-shadow:0 12px 40px rgba(16,24,40,0.06);font-family:Inter,system-ui,Segoe UI,Roboto,-apple-system,Arial}
      .header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
      .small{font-size:13px;color:#64748b}
      .escribir-grid{display:grid;grid-template-columns:1fr 420px;gap:20px}
      .panel{background:linear-gradient(180deg,#fff,#fff);padding:16px;border-radius:10px;border:1px solid rgba(16,24,40,0.04)}
      h2{color:#ff8b3d;margin:0}
      h3{color:#7a2e9a;margin:0 0 8px 0}
      label{font-size:13px;color:#374151;margin-bottom:6px;display:block}
      input[type="text"], input[type="url"], select, textarea{padding:10px;border-radius:8px;border:1px solid #e8e8ea;font-size:14px;outline:none}
      textarea{min-height:120px;resize:vertical}
      .portada-preview{width:120px;height:160px;object-fit:cover;border-radius:8px;border:1px solid #f0e5e8}
      .row{display:flex;gap:10px;align-items:center}
      .btn{background:#fff;border:none;padding:10px 14px;border-radius:10px;cursor:pointer;font-weight:600;box-shadow:0 6px 18px rgba(16,24,40,0.06)}
      .btn-primary{background:linear-gradient(180deg,#ffd6b3,#ffb07a);color:#3b1b00;box-shadow:0 8px 26px rgba(255,139,61,0.12)}
      .btn-soft{background:#fff;border:1px solid rgba(16,24,40,0.04)}
      .chapter-card{display:flex;gap:12px;align-items:flex-start;padding:10px;border-radius:10px;border:1px solid rgba(16,24,40,0.03);margin-bottom:10px;box-shadow:0 6px 18px rgba(16,24,40,0.03)}
      .sticker-thumb{width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #eee}
      .sticker-list{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
      .preview-area{background:#fffaf1;padding:12px;border-radius:8px;border:1px solid rgba(255,138,61,0.08)}
      .muted{color:#64748b;font-size:13px}
      .grid-two { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width:1000px){.escribir-grid{grid-template-columns:1fr;} .grid-two { grid-template-columns: 1fr; } }
    `;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = css;
    document.head.appendChild(style);
  }, []);

  // --- helpers para archivos y previews ---
  const handlePortada = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPortadaFile(f);
    setPortadaPreview(URL.createObjectURL(f));
  };

  const handleAddSticker = (file) => {
    if (!file) return;
    const type = file.type.startsWith("video") ? "video" : "image";
    const preview = URL.createObjectURL(file);
    setCapStickers((s) => [...s, { file, type, preview }]);
  };

  const handleRemoveSticker = (idx) => {
    setCapStickers((s) => {
      const arr = [...s];
      const [rem] = arr.splice(idx, 1);
      try { URL.revokeObjectURL(rem.preview); } catch {}
      return arr;
    });
  };

  const resetCapEditor = () => {
    setCapTitulo("");
    setCapContenido("");
    setCapMusicaUrl("");
    setCapMusicaFile(null);
    capStickers.forEach((s) => { try { URL.revokeObjectURL(s.preview); } catch {} });
    setCapStickers([]);
    setEditingIndex(-1);
    setVistaPreview(false);
  };

  // guardar capítulo localmente (antes de publicar)
  const handleSaveChapterLocal = () => {
    if (!capTitulo.trim() || !capContenido.trim()) {
      setMensaje("Completa título y contenido del capítulo");
      return;
    }

    const ch = {
      id: editingIndex >= 0 ? capitulos[editingIndex].id : `local-${Date.now()}`,
      titulo: capTitulo,
      contenido: capContenido,
      musicaUrl: capMusicaUrl || null,
      musicaFile: capMusicaFile || null,
      stickers: capStickers.map((s) => ({ preview: s.preview, type: s.type, file: s.file, uploadedUrl: s.uploadedUrl || null })),
      fecha: new Date().toISOString(),
      publishedId: capitulos[editingIndex]?.publishedId || null,
    };

    if (editingIndex >= 0) {
      setCapitulos((prev) => {
        const arr = [...prev];
        arr[editingIndex] = ch;
        return arr;
      });
      setMensaje("Capítulo actualizado localmente");
    } else {
      setCapitulos((prev) => [ch, ...prev]);
      setMensaje("Capítulo agregado localmente");
    }

    resetCapEditor();
  };

  const handleEditChapter = (index) => {
    const ch = capitulos[index];
    setEditingIndex(index);
    setCapTitulo(ch.titulo);
    setCapContenido(ch.contenido);
    setCapMusicaUrl(ch.musicaUrl || "");
    setCapMusicaFile(null);
    const sarr = (ch.stickers || []).map((s) => ({ file: s.file || null, type: s.type, preview: s.preview, uploadedUrl: s.uploadedUrl || s.preview }));
    setCapStickers(sarr);
    setVistaPreview(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteChapter = (index) => {
    if (!confirm("¿Eliminar capítulo?")) return;
    setCapitulos((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(index, 1);
      (removed?.stickers || []).forEach((s) => { try { URL.revokeObjectURL(s.preview); } catch {} });
      return arr;
    });
    setMensaje("Capítulo eliminado");
  };

  // upload helper
  async function uploadFileToStorage(folderPath, file) {
    const name = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `${folderPath}/${name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  }

  // PUBLICAR libro + capítulos (utiliza uploadFileToStorage y la estructura del corto)
  const handlePublishBook = async () => {
    if (!user) { alert("Debes iniciar sesión para publicar."); return; }
    if (!tituloLibro.trim() || !genero.trim()) { alert("Completa título y género del libro."); return; }
    if (!portadaFile) { alert("Sube una portada antes de publicar."); return; }
    if (capitulos.length === 0) { alert("Agrega al menos un capítulo."); return; }

    setSubiendo(true);
    setMensaje("");
    try {
      // 1) subir portada
      const portadaUrl = await uploadFileToStorage("portadas", portadaFile);

      // 2) crear documento libro
      const libroRef = await addDoc(collection(db, "libros"), {
        titulo: tituloLibro,
        genero,
        portada: portadaUrl,
        autor: user.displayName || user.email || "Autor",
        autorId: user.uid,
        permitirCalificacion: true,
        fecha: serverTimestamp(),
        estado: "publicado",
      });

      setLibroDocId(libroRef.id);

      // 3) subir capítulos a subcolección
      for (const ch of capitulos) {
        // subir stickers
        const stickersUrls = [];
        for (const s of ch.stickers || []) {
          if (s.file) {
            const url = await uploadFileToStorage(`capitulos/${libroRef.id}`, s.file);
            stickersUrls.push({ url, type: s.type });
          } else if (s.uploadedUrl) {
            stickersUrls.push({ url: s.uploadedUrl, type: s.type });
          } else if (s.preview && (s.preview.startsWith("http") || s.preview.startsWith("https"))) {
            stickersUrls.push({ url: s.preview, type: s.type });
          }
        }

        // subir música file si existe
        let musicaUrlFinal = ch.musicaUrl || null;
        if (ch.musicaFile) {
          musicaUrlFinal = await uploadFileToStorage(`capitulos/${libroRef.id}/musica`, ch.musicaFile);
        }

        const capRef = await addDoc(collection(db, `libros/${libroRef.id}/capitulos`), {
          tituloCapitulo: ch.titulo,
          contenido: ch.contenido,
          musica: musicaUrlFinal,
          stickers: stickersUrls,
          fecha: serverTimestamp(),
        });

        // assign publishedId locally for future edits
        ch.publishedId = capRef.id;
      }

      setMensaje("Libro publicado en tu perfil (borrador publicado). Ahora puedes seguir editando o marcar como TERMINADO.");
    } catch (err) {
      console.error(err);
      alert("Error al publicar: " + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  // MARCAR COMO TERMINADO
  const handleMarkAsFinished = async () => {
    if (!libroDocId) { alert("Primero debes publicar el libro (botón Publicar libro)."); return; }
    if (!confirm("¿Marcar este libro como terminado? (Los lectores verán la versión final)")) return;

    setSubiendo(true);
    try {
      const libroDocRef = doc(db, "libros", libroDocId);
      await updateDoc(libroDocRef, { estado: "terminado", fechaTerminado: serverTimestamp() });
      setLibroTerminado(true);
      setMensaje("Libro marcado como TERMINADO. Ahora puedes exportar a PDF o subir cambios finales.");
    } catch (err) {
      console.error(err);
      alert("Error al marcar como terminado: " + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  // ACTUALIZAR cambios en libro ya publicado (actualiza capítulos con publishedId)
  const handleUpdatePublishedChanges = async () => {
    if (!libroDocId) { alert("No hay libro publicado en el perfil aún."); return; }
    setSubiendo(true);
    setMensaje("");
    try {
      const libroRef = doc(db, "libros", libroDocId);
      let portadaUrl = null;
      if (portadaFile && portadaPreview && portadaPreview.startsWith("blob:")) {
        portadaUrl = await uploadFileToStorage("portadas", portadaFile);
      }
      const updateData = { titulo: tituloLibro, genero };
      if (portadaUrl) updateData.portada = portadaUrl;
      await updateDoc(libroRef, updateData);

      for (const ch of capitulos) {
        if (!ch.publishedId) continue;
        const capDocRef = doc(db, `libros/${libroDocId}/capitulos`, ch.publishedId);

        const stickersUrls = [];
        for (const s of ch.stickers || []) {
          if (s.file) {
            const url = await uploadFileToStorage(`capitulos/${libroDocId}`, s.file);
            stickersUrls.push({ url, type: s.type });
          } else if (s.uploadedUrl) {
            stickersUrls.push({ url: s.uploadedUrl, type: s.type });
          } else if (s.preview && (s.preview.startsWith("http") || s.preview.startsWith("https"))) {
            stickersUrls.push({ url: s.preview, type: s.type });
          }
        }

        let musicaUrlFinal = ch.musicaUrl || null;
        if (ch.musicaFile) {
          musicaUrlFinal = await uploadFileToStorage(`capitulos/${libroDocId}/musica`, ch.musicaFile);
        }

        await updateDoc(capDocRef, {
          tituloCapitulo: ch.titulo,
          contenido: ch.contenido,
          musica: musicaUrlFinal,
          stickers: stickersUrls,
          fecha: serverTimestamp(),
        });
      }

      setMensaje("Cambios subidos al libro en Perfil ✔");
    } catch (err) {
      console.error(err);
      alert("Error al actualizar: " + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  const publicarLibro = async () => {
  try {
    setSubiendo(true);

    // 1. SUBIR PORTADA
    let portadaURL = "";
    if (portadaFile) {
      const portadaRef = ref(storage, `portadas/${user.uid}/${Date.now()}`);
      await uploadBytes(portadaRef, portadaFile);
      portadaURL = await getDownloadURL(portadaRef);
    }

    // 2. SUBIR MÚSICA DE CADA CAPÍTULO
    const capitulosConMusica = [];
    for (const cap of capitulos) {
      let musicaURL = cap.musicaUrl || "";

      if (cap.musicaFile) {
        const musicaRef = ref(storage, `musica/${user.uid}/${Date.now()}_${cap.musicaFile.name}`);
        await uploadBytes(musicaRef, cap.musicaFile);
        musicaURL = await getDownloadURL(musicaRef);
      }

      capitulosConMusica.push({
        titulo: cap.titulo,
        contenido: cap.contenido,
        musicaUrl: musicaURL,
        stickers: cap.stickers || []
      });
    }

    // 3. GUARDAR EN FIRESTORE
    await addDoc(collection(db, "historias"), {
      uid: user.uid,
      titulo: tituloLibro,
      genero,
      portada: portadaURL,
      capitulos: capitulosConMusica,
      fecha: Date.now(),
    });

    setMensaje("Historia publicada con éxito ✔");
    setLibroTerminado(true);

  } catch (err) {
    console.log(err);
    setMensaje("Error al publicar la historia.");
  } finally {
    setSubiendo(false);
  }
};


  // EXPORTAR A PDF con jsPDF: texto + portada + autor + índice + stickers (imagenes)
  const handleExportPDF = async () => {
    if (!libroDocId) {
      if (!confirm("Aún no has publicado este libro en tu perfil. ¿Deseas generar PDF desde borrador local?")) return;
    }

    setSubiendo(true);
    setMensaje("");

    try {
      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margin * 2;
      let y = 60;

      // portada
      if (portadaPreview) {
        let imgDataUrl = null;
        if (portadaFile) {
          imgDataUrl = await fileToDataURL(portadaFile);
        } else if (portadaPreview.startsWith("http") || portadaPreview.startsWith("https")) {
          imgDataUrl = await urlToDataURL(portadaPreview);
        } else {
          imgDataUrl = await urlToDataURL(portadaPreview);
        }

        try {
          const imgProps = pdf.getImageProperties(imgDataUrl);
          const imgWidth = usableWidth;
          const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
          pdf.addImage(imgDataUrl, "JPEG", margin, y, imgWidth, imgHeight);
          y += imgHeight + 20;
        } catch (err) {
          console.warn("No se pudo añadir la imagen a PDF:", err);
        }
      }

      pdf.setFontSize(22);
      pdf.setTextColor("#333");
      pdf.text(tituloLibro || "Título sin definir", margin, y);
      y += 28;
      pdf.setFontSize(14);
      pdf.setTextColor("#555");
      pdf.text(`Autor: ${user?.displayName || user?.email || "Autor"}`, margin, y);
      y += 30;

      pdf.setFontSize(16);
      pdf.setTextColor("#ff8b3d");
      pdf.text("Índice", margin, y);
      y += 20;
      pdf.setFontSize(12);
      pdf.setTextColor("#333");
      capitulos.forEach((c, i) => {
        pdf.text(`${i + 1}. ${c.titulo}`, margin, y);
        y += 16;
      });

      pdf.addPage();
      y = 60;

      for (let i = 0; i < capitulos.length; i++) {
        const c = capitulos[i];
        pdf.setFontSize(16);
        pdf.setTextColor("#7a2e9a");
        pdf.text(`${i + 1}. ${c.titulo}`, margin, y);
        y += 22;

        pdf.setFontSize(12);
        pdf.setTextColor("#222");

        const lines = pdf.splitTextToSize(c.contenido || "(sin contenido)", usableWidth);
        pdf.text(lines, margin, y);
        y += lines.length * 14 + 12;

        // stickers (imágenes)
        for (const s of c.stickers || []) {
          try {
            let url = s.uploadedUrl || s.preview;
            if (!url && s.file) url = await fileToDataURL(s.file);
            else if (url && url.startsWith("blob:")) url = await urlToDataURL(url);

            if (url) {
              const prop = pdf.getImageProperties(url);
              const imgW = Math.min(usableWidth / 3, prop.width);
              const imgH = (prop.height * imgW) / prop.width;
              if (y + imgH > pdf.internal.pageSize.getHeight() - 60) {
                pdf.addPage();
                y = 60;
              }
              pdf.addImage(url, "JPEG", margin, y, imgW, imgH);
              y += imgH + 8;
            }
          } catch (err) {
            console.warn("No se pudo añadir sticker al PDF", err);
          }
        }

        if (i < capitulos.length - 1 && y > pdf.internal.pageSize.getHeight() - 120) {
          pdf.addPage();
          y = 60;
        } else if (i < capitulos.length - 1) {
          y += 10;
        }
      }

      const filename = (tituloLibro || "mi-libro").replace(/\s+/g, "_") + ".pdf";
      pdf.save(filename);
      setMensaje("PDF generado ✔");
    } catch (err) {
      console.error(err);
      alert("Error al generar PDF: " + (err.message || err));
    } finally {
      setSubiendo(false);
    }
  };

  // helpers to convert file or URL to dataURL
  async function fileToDataURL(file) {
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(file);
    });
  }
  async function urlToDataURL(url) {
    const resp = await fetch(url);
    const blob = await resp.blob();
    return await new Promise((res, rej) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result);
      fr.onerror = rej;
      fr.readAsDataURL(blob);
    });
  }

  // Save / Load draft local (no files)
  function guardarDraftLocal() {
    const draft = {
      tituloLibro,
      genero,
      portadaPreview,
      capitulos: capitulos.map((c) => ({
        ...c,
        stickers: (c.stickers || []).map((s) => ({ preview: s.preview, type: s.type, uploadedUrl: s.uploadedUrl || null })),
        musicaFile: null,
      })),
      fecha: new Date().toISOString(),
    };
    localStorage.setItem("escribir_draft", JSON.stringify(draft));
    setMensaje("Borrador guardado localmente ✔");
  }
  function cargarDraftLocal() {
    const raw = localStorage.getItem("escribir_draft");
    if (!raw) { setMensaje("No hay borrador guardado"); return; }
    try {
      const d = JSON.parse(raw);
      setTituloLibro(d.tituloLibro || "");
      setGenero(d.genero || "");
      setPortadaPreview(d.portadaPreview || "");
      setCapitulos(d.capitulos || []);
      setMensaje("Borrador cargado ✔");
    } catch {
      setMensaje("Error al cargar borrador");
    }
  }

  // RENDER
  return (
    <div className="escribir-root">
      <div className="header-row">
        <div>
          <h2>Editor de Historias</h2>
          <div className="small">Todo en una sola página — naranja suave ✨</div>
        </div>

        <div className="row">
          <button className="btn btn-soft" onClick={guardarDraftLocal}>Guardar borrador</button>
          <button className="btn btn-soft" onClick={cargarDraftLocal}>Cargar borrador</button>
          <button className="btn btn-primary" onClick={publicarLibro} disabled={subiendo}>
            {subiendo ? "Publicando..." : (libroDocId ? "Re-publicar libro" : "Publicar libro")}
          </button>
        </div>
      </div>

      <div className="escribir-grid">
        {/* Panel principal */}
        <div className="panel">
          <h3>Datos del libro</h3>

          <div className="field" style={{ marginBottom: 12 }}>
            <label>Título</label>
            <input type="text" value={tituloLibro} onChange={(e) => setTituloLibro(e.target.value)} placeholder="Título del libro" />
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Género</label>
              <select value={genero} onChange={(e) => setGenero(e.target.value)}>
                <option value="">Selecciona un género</option>
                <option value="romance">💞 Romance</option>
                <option value="fantasia">🧚 Fantasía</option>
                <option value="ciencia-ficcion">🚀 Ciencia ficción</option>
                <option value="misterio">🕵️ Misterio</option>
                <option value="drama">🎭 Drama</option>
                <option value="terror">👻 Terror</option>
                <option value="comedia">😂 Comedia</option>
                <option value="aventura">🌍 Aventura</option>
              </select>
            </div>

            <div style={{ width: 170 }}>
              <label>Portada</label>
              <input ref={filePortadaRef} type="file" accept="image/*" onChange={handlePortada} />
              {portadaPreview ? <img src={portadaPreview} alt="portada" className="portada-preview" style={{ marginTop: 8 }} /> : <div className="muted" style={{ marginTop: 8 }}>Sin portada</div>}
            </div>
          </div>

          <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #f6eee9" }} />

          <h3>Editor de capítulo</h3>
          <div className="field">
            <label>Título del capítulo</label>
            <input type="text" value={capTitulo} onChange={(e) => setCapTitulo(e.target.value)} placeholder="Ej: Capítulo 1 — El inicio" />
          </div>

          <div className="field">
            <label>Contenido</label>
            <textarea value={capContenido} onChange={(e) => setCapContenido(e.target.value)} placeholder="Escribe el contenido..." />
          </div>

          <div className="row" style={{ gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Música (URL)</label>
              <input type="url" value={capMusicaUrl} onChange={(e) => setCapMusicaUrl(e.target.value)} placeholder="https://..." />
            </div>

            <div style={{ width: 180 }}>
              <label>ó Subir audio (mp3)</label>
              <input type="file" accept="audio/*" onChange={(e) => setCapMusicaFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <label>Stickers (imagen / video)</label>
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <label className="btn btn-soft" style={{ cursor: "pointer" }}>
                Adjuntar
                <input type="file" accept="image/*,video/*" hidden onChange={(e) => handleAddSticker(e.target.files?.[0])} />
              </label>

              <div className="small">Se permiten imágenes y videos; se mostrarán como miniaturas.</div>
            </div>

            <div className="sticker-list" style={{ marginTop: 8 }}>
              {capStickers.map((s, idx) => (
                <div key={idx} style={{ position: "relative" }}>
                  {s.type === "image" ? <img src={s.preview} alt="" className="sticker-thumb" /> : <video src={s.preview} className="sticker-thumb" controls muted />}
                  <button className="btn" style={{ position: "absolute", top: -6, right: -6 }} onClick={() => handleRemoveSticker(idx)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button className="btn btn-soft" onClick={() => setVistaPreview(!vistaPreview)}>{vistaPreview ? "Ocultar preview" : "Vista previa"}</button>
            <button className="btn btn-soft" onClick={() => resetCapEditor()}>Limpiar</button>
            <button className="btn btn-primary" onClick={handleSaveChapterLocal}>{editingIndex >= 0 ? "Guardar cambios" : "Agregar capítulo"}</button>
          </div>

          {vistaPreview && (
            <div className="preview-area" style={{ marginTop: 12 }}>
              <h4 style={{ marginTop: 0 }}>{capTitulo || "Título del capítulo"}</h4>
              <div style={{ whiteSpace: "pre-wrap", color: "#334155" }}>{capContenido || "Contenido..."}</div>
              <div style={{ marginTop: 8 }}>
                {capMusicaUrl && <div className="small">Música (URL): <a href={capMusicaUrl} target="_blank" rel="noreferrer" style={{ color: "#ff8b3d" }}>{capMusicaUrl}</a></div>}
                {capMusicaFile && <div className="small">Música (archivo): {capMusicaFile.name}</div>}
                <div style={{ marginTop: 8 }} className="sticker-list">
                  {capStickers.map((s, i) => s.type === "image" ? <img key={i} src={s.preview} className="sticker-thumb" /> : <video key={i} src={s.preview} className="sticker-thumb" controls />)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side panel: capítulos list y acciones */}
        <div className="panel">
          <h3>Capítulos añadidos</h3>
          <div style={{ maxHeight: 360, overflow: "auto", paddingRight: 6 }}>
            {capitulos.length === 0 && <div className="small">Aún no has agregado capítulos.</div>}
            {capitulos.map((c, i) => (
              <div key={c.id || i} className="chapter-card">
                <div style={{ flex: 1 }}>
                  <strong>{c.titulo}</strong>
                  <div className="small" style={{ marginTop: 6 }}>{(c.contenido || "").slice(0, 120)}{c.contenido && c.contenido.length > 120 ? "..." : ""}</div>
                  <div className="small" style={{ marginTop: 6 }}>Guardado: {new Date(c.fecha).toLocaleString()}</div>
                  <div style={{ marginTop: 8 }} className="row">
                    <button className="btn" onClick={() => handleEditChapter(i)}>✏️ Editar</button>
                    <button className="btn" onClick={() => handleDeleteChapter(i)}>🗑️ Eliminar</button>
                    <button className="btn" onClick={() => { setVistaPreview(true); setCapTitulo(c.titulo); setCapContenido(c.contenido); setCapStickers(c.stickers || []); setCapMusicaUrl(c.musicaUrl || ""); }}>👀 Ver</button>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {(c.stickers || []).slice(0, 2).map((s, idx) => (
                    s.type === "image" ? <img key={idx} src={s.preview || s.uploadedUrl} className="sticker-thumb" alt="" /> : <video key={idx} src={s.preview || s.uploadedUrl} className="sticker-thumb" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #f6eee9" }} />

          <div className="small">Vista rápida del libro</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 10 }}>
            {portadaPreview ? <img src={portadaPreview} className="portada-preview" alt="portada" /> : <div style={{ width:120,height:160,display:"flex",alignItems:"center",justifyContent:"center",color:"#cbd5e1",borderRadius:8,border:"1px dashed #eee" }}>Portada</div>}
            <div>
              <div style={{ fontWeight:700 }}>{tituloLibro || "Título del libro"}</div>
              <div className="small">{genero || "Género"}</div>
              <div className="small">{capitulos.length} capítulos</div>
            </div>
          </div>

          <div style={{ marginTop: 12, display: "flex", gap: 8, flexDirection: "column" }}>
            <button className="btn btn-primary" onClick={handleMarkAsFinished} disabled={!libroDocId || libroTerminado}>
              {libroTerminado ? "Libro terminado" : "Marcar como TERMINADO"}
            </button>

            <button className="btn btn-soft" onClick={handleUpdatePublishedChanges} disabled={!libroDocId}>
              Subir cambios al libro en Perfil
            </button>

            <button className="btn btn-soft" onClick={handleExportPDF} disabled={subiendo}>
              Exportar a PDF (texto + portada + autor + índice)
            </button>
          </div>

          {mensaje && <div style={{ marginTop: 12, color: "#7a2e9a" }}>{mensaje}</div>}
          <div style={{ marginTop: 10 }} className="small">Recuerda: stickers (img/video) y audio se suben a Storage al publicar o al subir cambios.</div>
        </div>
      </div>
    </div>
  );
}
