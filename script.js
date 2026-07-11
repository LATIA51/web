const menu = document.getElementById("menu");
const pantalla = document.getElementById("pregunta");
const contenido = document.getElementById("contenido");
const titulo = document.getElementById("tituloPregunta");

let actual = null;
let rondaActual = 1;

// ─── Tablero ──────────────────────────────────────────────────────────────────

function crearTablero() {
    menu.innerHTML = "";

    document.getElementById("tituloRonda").innerText = "RONDA " + rondaActual;

    const preguntasRonda = preguntas.filter(x => x.ronda === rondaActual);
    const categorias = [...new Set(preguntasRonda.map(x => x.categoria))];

    categorias.forEach(cat => {
        const div = document.createElement("div");
        div.className = "categoria";
        div.innerHTML = `<h2>${cat}</h2>`;

        [100, 200, 300, 400, 500].forEach(valor => {
            const p = preguntasRonda.find(
                x => x.categoria === cat && x.valor === valor
            );
            if (!p) return;

            const b = document.createElement("div");
            b.className = "valor";
            b.innerText = "$" + valor;

            const clave = rondaActual + "-" + cat + "-" + valor;

            if (localStorage.getItem(clave)) {
                b.classList.add("usada");
            }

            b.onclick = () => abrirPregunta(p, b, clave);
            div.appendChild(b);
        });

        menu.appendChild(div);
    });

    const boton = document.getElementById("siguienteRonda");
    if (rondaActual === 1)      boton.innerText = "SIGUIENTE RONDA →";
    else if (rondaActual === 2) boton.innerText = "RONDA FINAL →";
    else                        boton.innerText = "VOLVER A RONDA 1";
}

// ─── Aplicar tamaño a un elemento ────────────────────────────────────────────

function aplicarTamano(el, ancho, alto) {
    if (ancho) el.style.width  = ancho + "px";
    if (alto)  el.style.height = alto  + "px";
}

// ─── Aplicar recorte de tiempo a audio o video ────────────────────────────────
// desde: segundo donde empieza  (campo: audiodesde / videodesde)
// hasta: segundo donde se para  (campo: audiohasta / videohasta)

function aplicarTiempo(el, desde, hasta) {
    if (desde) {
        el.addEventListener("loadedmetadata", () => {
            el.currentTime = desde;
        });
    }
    if (hasta) {
        el.addEventListener("timeupdate", () => {
            if (el.currentTime >= hasta) {
                el.pause();
            }
        });
    }
}

// ─── Abrir pregunta ───────────────────────────────────────────────────────────

function abrirPregunta(pregunta, boton, clave) {
    actual = { pregunta, boton, clave };

    menu.style.display = "none";
    pantalla.classList.remove("oculto");

    titulo.innerText = pregunta.categoria + " · $" + pregunta.valor;
    contenido.innerHTML = "";

    if (pregunta.pregunta) {
        const h = document.createElement("h1");
        h.innerHTML = pregunta.pregunta.replace(/\n/g, "<br>");
        contenido.appendChild(h);
    }

    if (pregunta.imagen) {
        const imgWrapper = document.createElement("div");
        imgWrapper.style.display = "flex";
        imgWrapper.style.gap = "16px";
        imgWrapper.style.justifyContent = "center";
        imgWrapper.style.alignItems = "center";

        const img = document.createElement("img");
        img.src = pregunta.imagen;
        img.alt = "Imagen de la pregunta";
        aplicarTamano(img, pregunta.ancho, pregunta.alto);
        imgWrapper.appendChild(img);

        if (pregunta.imagen2) {
            const img2 = document.createElement("img");
            img2.src = pregunta.imagen2;
            img2.alt = "Imagen 2 de la pregunta";
            aplicarTamano(img2, pregunta.ancho2, pregunta.alto2);
            imgWrapper.appendChild(img2);
        }

        contenido.appendChild(imgWrapper);
    }

    if (pregunta.audio) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.autoplay = true;
        const src = document.createElement("source");
        src.src = pregunta.audio;
        audio.appendChild(src);
        aplicarTiempo(audio, pregunta.audiodesde, pregunta.audiohasta);
        contenido.appendChild(audio);
    }

    if (pregunta.video) {
        const video = document.createElement("video");
        video.controls = true;
        video.autoplay = true;
        const src = document.createElement("source");
        src.src = pregunta.video;
        video.appendChild(src);
        aplicarTamano(video, pregunta.ancho, pregunta.alto);
        aplicarTiempo(video, pregunta.videodesde, pregunta.videohasta);
        contenido.appendChild(video);
    }
}

// ─── Ver respuesta ────────────────────────────────────────────────────────────

document.getElementById("verRespuesta").onclick = () => {
    const p = actual.pregunta;

    contenido.innerHTML = "";

    const respDiv = document.createElement("div");
    respDiv.className = "respuesta-bloque";

    const h = document.createElement("h1");
    h.style.color = "gold";
    h.textContent = p.respuesta;
    respDiv.appendChild(h);

    if (p.imagenrespuesta) {
        const img = document.createElement("img");
        img.src = p.imagenrespuesta;
        img.alt = "Imagen de la respuesta";
        aplicarTamano(img, p.anchoresp, p.altoresp);
        respDiv.appendChild(img);
    }

    if (p.videorespuesta) {
        const video = document.createElement("video");
        video.controls = true;
        video.autoplay = true;
        const src = document.createElement("source");
        src.src = p.videorespuesta;
        video.appendChild(src);
        aplicarTamano(video, p.anchoresp, p.altoresp);
        aplicarTiempo(video, p.videorespdesde, p.videorespondhasta);
        respDiv.appendChild(video);
    }

    if (p.audiorespuesta) {
        const audio = document.createElement("audio");
        audio.controls = true;
        audio.autoplay = true;
        const src = document.createElement("source");
        src.src = p.audiorespuesta;
        audio.appendChild(src);
        aplicarTiempo(audio, p.audiorespdesde, p.audiorespondhasta);
        respDiv.appendChild(audio);
    }

    contenido.appendChild(respDiv);
};

// ─── Volver al tablero ────────────────────────────────────────────────────────

document.getElementById("volver").onclick = () => {
    localStorage.setItem(actual.clave, "1");
    actual.boton.classList.add("usada");
    pantalla.classList.add("oculto");
    menu.style.display = "grid";
};

// ─── Reiniciar ────────────────────────────────────────────────────────────────

document.getElementById("reiniciar").onclick = () => {
    localStorage.clear();
    crearTablero();
};

// ─── Siguiente ronda ──────────────────────────────────────────────────────────

document.getElementById("siguienteRonda").onclick = () => {
    if (rondaActual < 3) rondaActual++;
    else                  rondaActual = 1;
    crearTablero();
};

crearTablero();