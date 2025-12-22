let vistaActual = 'home';
let equipoSeleccionado = null;
let filtroJugadores = 'semana'; // 'semana' o 'global'

// --- LÓGICA DE GRL Y STATS ---

function calcularStatsFIFA(j) {
    if (!j.stats) return { PAC: 50, SHO: 50, PAS: 50, DRI: 50, DEF: 50, PHY: 50 };
    const s = j.stats;
    const pos = j.posicion[0];
    if (pos === "POR") {
        return {
            PAC: Math.round(s.velocidad * 0.9), SHO: Math.round(s.tecnica * 0.7),
            PAS: Math.round(s.tecnica * 0.8), DRI: Math.round(s.aceleracion),
            DEF: Math.round(s.defensa), PHY: Math.round(s.resistencia)
        };
    }
    return {
        PAC: Math.round((s.velocidad + s.aceleracion) / 2),
        SHO: Math.round((s.tiro + s.potencia) / 2),
        PAS: Math.round(s.tecnica),
        DRI: Math.round((s.tecnica + s.regates) / 2),
        DEF: Math.round(s.defensa),
        PHY: Math.round((s.potencia + s.resistencia) / 2)
    };
}

function calcularOVRPosicional(j, pos) {
    const f = calcularStatsFIFA(j);
    let grl = 75;
    if (pos === "DEL" || pos === "9") grl = (f.SHO * 0.50 + f.PAC * 0.25 + f.DRI * 0.15 + f.PHY * 0.10);
    else if (pos === "EXT") grl = (f.PAC * 0.45 + f.DRI * 0.30 + f.SHO * 0.15 + f.PAS * 0.10);
    else if (pos === "MC" || pos === "MCO") grl = (f.PAS * 0.40 + f.DRI * 0.30 + f.PHY * 0.20 + f.SHO * 0.10);
    else if (pos === "DEF") grl = (f.DEF * 0.65 + f.PHY * 0.25 + f.PAC * 0.10);
    else if (pos === "POR") grl = (f.DEF * 0.85 + f.PHY * 0.15);
    return Math.min(99, Math.round(grl));
}

function calcularOVR(j) {
    const ratings = j.posicion.map(p => calcularOVRPosicional(j, p));
    return Math.max(...ratings);
}

function obtenerGRLMediaEquipo(equipo) {
    const sum = equipo.jugadores.reduce((acc, j) => acc + calcularOVR(j), 0);
    return Math.round(sum / equipo.jugadores.length);
}

function obtenerRanking(tipo = 'semana') {
    const todos = data.equipos.flatMap(e => e.jugadores.map(j => {
        return {
            ...j,
            equipoNombre: e.nombre,
            equipoEscudo: e.escudo,
            ovrCalculado: calcularOVR(j)
        };
    }));

    return todos.sort((a, b) => {
        let pA, pB;
        if (tipo === 'semana') {
            pA = (a.semana?.goles || 0) + (a.semana?.asistencias || 0);
            pB = (b.semana?.goles || 0) + (b.semana?.asistencias || 0);
        } else {
            pA = (a.golesTotales || 0) + (a.asistenciasTotales || 0);
            pB = (b.golesTotales || 0) + (b.asistenciasTotales || 0);
        }
        if (pB !== pA) return pB - pA;
        return b.ovrCalculado - a.ovrCalculado;
    });
}

function obtenerFotoJugador(j) {
    if (j.foto && j.foto !== "Jugador_Generico.png" && j.foto !== "") return j.foto;
    if (j.posicion.includes("POR")) return "arquero_pose.png";
    const seed = (j.nombre.length % 3) + 1; 
    return `pose_${seed}.png`;
}

function generarEstrellas(cantidad) {
    let estrellas = '';
    for (let i = 1; i <= 5; i++) {
        estrellas += i <= cantidad ? `<span style="color:var(--accent)">★</span>` : `<span style="color:#444">★</span>`;
    }
    return estrellas;
}

// --- GENERADOR DE CARTAS ---

function generarHtmlCarta(j, esMini = false, posEfectiva = null) {
    const pos = posEfectiva || j.posicion[0];
    const ovr = j.ovrCalculado || calcularOVR(j);
    const f = calcularStatsFIFA(j);
    const rareza = ovr >= 85 ? 'especial' : (ovr >= 75 ? 'oro' : 'plata');
    const colorPos = `var(--color-${pos})`;
    const fotoFinal = obtenerFotoJugador(j);
    const glowClass = ovr >= 88 ? 'elite-glow' : '';
    const escudoClub = j.equipoEscudo || data.equipos.find(e => e.jugadores.some(pj => pj.nombre === j.nombre))?.escudo;

    if (esMini) {
        return `
        <div class="fut-card-rect mini card-${rareza} ${glowClass}" style="border-top-color:${colorPos}">
            <div class="card-top">
                <div class="ovr-badge" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 4px; gap: 2px;">
                    <span class="val" style="color:${colorPos}; font-size: 0.9rem; line-height: 1;">${ovr}</span>
                    <img src="${escudoClub}" style="width: 14px; filter: drop-shadow(0 2px 2px black);">
                    <span class="pos" style="font-size: 0.6rem; line-height: 1; font-weight: bold;">${pos}</span>
                </div>
                <img src="${fotoFinal}" class="player-img-full">
            </div>
            <div class="card-bottom" style="background:${colorPos}; color: black;">
                <div class="p-name" style="font-size: 0.65rem;">${j.nombre.split(' ').pop().toUpperCase()}</div>
            </div>
        </div>`;
    }

    return `
        <div class="fut-card-rect card-big card-${rareza} ${glowClass}" style="border-top: 5px solid ${colorPos}; width:300px; height:420px;">
            <div class="card-top">
                <div class="ovr-badge" style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding-top: 15px; gap: 8px; width: 70px;">
                    <span class="val" style="color:${colorPos}; font-size: 2.2rem; line-height: 0.8; text-shadow: 2px 2px 0px #000;">${ovr}</span>
                    <img src="${escudoClub}" style="width: 32px; filter: drop-shadow(0 4px 4px rgba(0,0,0,0.8));">
                    <span class="pos" style="font-size: 1.2rem; font-weight: 800; text-shadow: 2px 2px 0px #000;">${pos}</span>
                </div>
                <img src="${fotoFinal}" class="player-img-full">
            </div>
            <div class="card-bottom">
                <div class="p-name" style="font-size:1.5rem; margin-bottom:5px;">${j.nombre}</div>
                <div style="font-size: 0.75rem; color: #fff; margin-bottom: 10px; font-weight:bold;">
                    PIE: ${j.piernaHabil || 'DERECHO'} | PM: ${generarEstrellas(j.piernaMala || 3)}
                </div>
                <div class="stats-grid" style="gap:12px; font-size:1rem">
                    <div class="stat-item"><span>${f.PAC}</span> PAC</div><div class="stat-item"><span>${f.DRI}</span> DRI</div>
                    <div class="stat-item"><span>${f.SHO}</span> SHO</div><div class="stat-item"><span>${f.DEF}</span> DEF</div>
                    <div class="stat-item"><span>${f.PAS}</span> PAS</div><div class="stat-item"><span>${f.PHY}</span> PHY</div>
                </div>
            </div>
        </div>`;
}

// --- VISTAS ---

function renderHome(cont) {
    const top3Semanales = obtenerRanking('semana').slice(0, 3);
    const ultimo = data.partidos[data.partidos.length - 1];
    cont.innerHTML = `
        <div style="padding: 20px; max-width: 900px; margin: auto;">
            <div style="background: linear-gradient(45deg, #11141b, #1a1f29); padding: 30px; border-radius: 20px; border: 1px solid var(--accent); margin-bottom: 30px; text-align:center; position:relative; box-shadow: 0 0 20px rgba(0, 242, 255, 0.2);">
                <div style="position:absolute; top:12px; left:50%; transform:translateX(-50%); font-size:0.75rem; color:var(--accent); font-weight:bold; letter-spacing:3px; text-transform:uppercase;">Último Partido</div>
                <div style="display:flex; align-items:center; justify-content:center; gap:40px; margin-top:20px;">
                    <div style="text-align:right; flex:1;"><h2 style="margin:0;">${ultimo.local}</h2></div>
                    <div style="font-size:3.5rem; font-weight:900; color:var(--accent); text-shadow: 0 0 15px var(--accent);">${ultimo.scoreL} - ${ultimo.scoreV}</div>
                    <div style="text-align:left; flex:1;"><h2 style="margin:0;">${ultimo.visitante}</h2></div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 25px;">
                <div style="background: var(--card-bg); padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);">
                    <h3 style="margin:0 0 20px 0; color:var(--accent); font-size: 0.9rem; text-transform: uppercase;">🔥 Cracks de la Semana</h3>
                    ${top3Semanales.map((j, i) => `
                        <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid rgba(255,255,255,0.05);">
                            <span><b>#${i+1}</b> ${j.nombre}</span>
                            <span style="opacity:0.8;">${j.semana.goles} G | ${j.semana.asistencias} A</span>
                        </div>
                    `).join('')}
                </div>
                <div style="display:flex; flex-direction:column; gap:20px;">
                    <div class="player-card" onclick="cambiarVista('dreamteam')" style="flex:1; cursor:pointer; text-align:center; border: 1px solid var(--accent); background: linear-gradient(135deg, #11141b, #0a0c10); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; box-shadow: 0 0 15px rgba(0, 242, 255, 0.2); transition: 0.3s;">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">⭐</div>
                        <h2 style="margin:0; font-size: 1.4rem; letter-spacing: 1px;">DREAM TEAM</h2>
                        <small style="color:var(--accent); font-weight: bold;">EL 7 IDEAL</small>
                    </div>
                    <div class="player-card" onclick="cambiarVista('jugadores')" style="flex:1; cursor:pointer; text-align:center; border: 1px solid var(--accent); background: linear-gradient(135deg, #1a1f29, #11141b); display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; box-shadow: 0 0 15px rgba(0, 242, 255, 0.2); transition: 0.3s;">
                        <div style="font-size: 2.5rem; margin-bottom: 10px;">👤</div>
                        <h2 style="margin:0; font-size: 1.4rem; letter-spacing: 1px;">JUGADORES</h2>
                        <small style="color:var(--accent); font-weight: bold;">RANKING GLOBAL</small>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderJugadores(cont) {
    const r = obtenerRanking(filtroJugadores);
    cont.innerHTML = `
        <div style="padding:20px; width:100%; box-sizing:border-box;">
            <div style="display:flex; justify-content:center; gap:10px; margin-bottom:30px;">
                <button onclick="setFiltro('semana')" style="background:${filtroJugadores==='semana' ? 'var(--accent)' : 'var(--card-bg)'}; color:${filtroJugadores==='semana' ? 'black' : 'white'}; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; box-shadow: ${filtroJugadores==='semana' ? '0 0 15px var(--accent)' : 'none'};">RANKING SEMANAL</button>
                <button onclick="setFiltro('global')" style="background:${filtroJugadores==='global' ? 'var(--accent)' : 'var(--card-bg)'}; color:${filtroJugadores==='global' ? 'black' : 'white'}; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; transition:0.3s; box-shadow: ${filtroJugadores==='global' ? '0 0 15px var(--accent)' : 'none'};">RANKING HISTÓRICO</button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px;">
                ${r.map((j, index) => {
                    const esSemana = filtroJugadores === 'semana';
                    const participaciones = esSemana ? (j.semana.goles + j.semana.asistencias) : (j.golesTotales + j.asistenciasTotales);
                    const golesDetalle = esSemana ? j.semana.goles : j.golesTotales;
                    const asistDetalle = esSemana ? j.semana.asistencias : j.asistenciasTotales;

                    return `
                    <div class="player-card" style="border-top:4px solid var(--color-${j.posicion[0]}); padding: 15px 20px; position: relative; overflow: hidden;" onclick="mostrarCarta('${j.nombre}')">
                        <div style="display:flex; align-items:center; gap:20px; width:100%;">
                            <div style="font-size:1.4rem; font-weight:900; color:rgba(255,255,255,0.1); width:40px;">#${index + 1}</div>
                            <img src="${obtenerFotoJugador(j)}" style="width:70px; height:70px; border-radius:12px; object-fit:cover; background:#000; border:1px solid rgba(255,255,255,0.1);">
                            
                            <div style="flex:2; min-width:0;">
                                <h3 style="margin:0; font-size:1.2rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${j.nombre}</h3>
                                <div style="margin-top:4px;">
                                    <span style="color:var(--accent); font-weight:bold; text-transform:uppercase; font-size:0.7rem;">${esSemana ? 'Esta Semana' : 'Histórico'}</span><br>
                                    <span style="opacity:0.7; font-size:0.85rem;">${golesDetalle} Goles | ${asistDetalle} Asist.</span>
                                </div>
                            </div>

                            <div style="text-align:right; border-right:1px solid rgba(255,255,255,0.1); padding-right:20px; flex:1;">
                                <div style="font-size:1.8rem; font-weight:900; color:white; line-height:1;">${participaciones}</div>
                                <div style="font-size:0.55rem; opacity:0.6; text-transform:uppercase; font-weight:bold;">PART.</div>
                            </div>

                            <div style="text-align:center; min-width:55px;">
                                <div style="font-size:2rem; font-weight:900; color:var(--color-${j.posicion[0]}); line-height:1;">${j.ovrCalculado}</div>
                                <div style="font-size:0.65rem; opacity:0.6; text-transform:uppercase; font-weight:bold;">GRL</div>
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
}

function setFiltro(f) {
    filtroJugadores = f;
    render();
}

function renderEquipos(cont) {
    cont.innerHTML = `<div class="cards-grid" style="padding:20px;">
        ${data.equipos.map((e, i) => {
            const grlMedia = obtenerGRLMediaEquipo(e);
            return `
            <div class="player-card" onclick="verPlantel(${i})" style="text-align:center; padding:30px; position:relative; overflow:visible; border: 1px solid rgba(255,255,255,0.1);">
                <div style="position:absolute; top:-10px; right:-10px; background:var(--accent); color:black; width:45px; height:45px; border-radius:12px; display:flex; flex-direction:column; align-items:center; justify-content:center; box-shadow:0 0 15px var(--accent); border: 2px solid #000; z-index:10;">
                    <span style="font-size:0.6rem; font-weight:bold; line-height:1;">GRL</span>
                    <span style="font-size:1.2rem; font-weight:900; line-height:1;">${grlMedia}</span>
                </div>
                <img src="${e.escudo}" style="width:90px; margin-bottom:15px; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));">
                <h2 style="margin:0; letter-spacing:1px;">${e.nombre}</h2>
                <small style="color:var(--muted)">${e.jugadores.length} JUGADORES</small>
            </div>`;
        }).join('')}
    </div>`;
}

function renderDreamTeam(cont) {
    const dt = armarMejorEquipoConSuplentes();
    cont.innerHTML = `
        <div style="padding: 20px; max-width: 1000px; margin: auto;">
            <h2 style="text-align:center; color:var(--accent); text-transform:uppercase; letter-spacing:3px; text-shadow: 0 0 10px var(--accent);">Dream Team de la Semana</h2>
            <div style="position: relative; width: 100%; max-width: 500px; height: 650px; background: #2e7d32; margin: 30px auto; border: 4px solid white; border-radius: 10px; box-shadow: 0 0 40px rgba(0,0,0,0.5); overflow: hidden;">
                <div style="position: absolute; top: 50%; width: 100%; height: 2px; background: white;"></div>
                <div style="position: absolute; top: 50%; left: 50%; width: 120px; height: 120px; border: 2px solid white; border-radius: 50%; transform: translate(-50%, -50%);"></div>
                <div style="position: absolute; top: 0; left: 50%; width: 220px; height: 90px; border: 2px solid white; border-top: none; transform: translateX(-50%);"></div>
                <div style="position: absolute; bottom: 0; left: 50%; width: 220px; height: 90px; border: 2px solid white; border-bottom: none; transform: translateX(-50%);"></div>
                ${dt.titulares.map(item => `
                    <div style="position: absolute; top: ${item.slot.t}; left: ${item.slot.l}; transform: translate(-50%, -50%); z-index: 100;" onclick="mostrarCarta('${item.j.nombre}')">
                        ${generarHtmlCarta(item.j, true, item.pos)}
                    </div>
                `).join('')}
            </div>
            <div style="background: rgba(0,0,0,0.5); border-radius: 20px; padding: 20px; border: 1px solid rgba(255,255,255,0.1);">
                <h3 style="text-align: center; font-size: 0.8rem; color: var(--muted); text-transform: uppercase; margin-bottom: 20px;">Banco de Suplentes</h3>
                <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                    ${dt.suplentes.map(j => `<div onclick="mostrarCarta('${j.nombre}')">${generarHtmlCarta(j, true)}</div>`).join('')}
                </div>
            </div>
        </div>`;
}

function armarMejorEquipoConSuplentes() {
    const ranking = obtenerRanking('semana');
    const tactica = {
        slots: [
            { t: "15%", l: "30%", req: "DEL" }, { t: "15%", l: "70%", req: "DEL" },
            { t: "45%", l: "30%", req: "MC" }, { t: "45%", l: "70%", req: "MC" },
            { t: "72%", l: "25%", req: "DEF" }, { t: "72%", l: "75%", req: "DEF" },
            { t: "88%", l: "50%", req: "POR" }
        ]
    };
    let usados = new Set();
    let titulares = [];
    tactica.slots.forEach(s => {
        const elegido = ranking
            .filter(j => !usados.has(j.nombre) && j.posicion.includes(s.req))
            .sort((a, b) => {
                const pA = (a.semana?.goles || 0) + (a.semana?.asistencias || 0);
                const pB = (b.semana?.goles || 0) + (b.semana?.asistencias || 0);
                return (pB - pA) || (b.ovrCalculado - a.ovrCalculado);
            })[0];
        if (elegido) { usados.add(elegido.nombre); titulares.push({ j: elegido, slot: s, pos: s.req }); }
    });
    const suplentes = ranking.filter(j => !usados.has(j.nombre)).slice(0, 5);
    return { titulares, suplentes };
}

function renderPlantel(cont) {
    const eq = data.equipos[equipoSeleccionado];
    cont.innerHTML = `
        <div style="padding:20px;">
            <button class="nav-btn" onclick="cambiarVista('equipos')" style="margin-bottom: 20px;">← VOLVER</button>
            <div style="text-align:center; margin:40px 0;"><img src="${eq.escudo}" style="width:100px; filter: drop-shadow(0 0 10px var(--accent));"><h1>${eq.nombre}</h1></div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(110px, 1fr)); gap:15px; justify-items:center;">
                ${eq.jugadores.map(j => {
                    const jConOvr = {...j, equipoEscudo: eq.escudo, ovrCalculado: calcularOVR(j)};
                    return `<div onclick="mostrarCarta('${j.nombre}')">${generarHtmlCarta(jConOvr, true)}</div>`;
                }).join('')}
            </div>
        </div>`;
}

function renderPartidos(cont) {
    cont.innerHTML = `<div style="padding:20px; max-width:600px; margin:auto;">
        ${[...data.partidos].reverse().map(m => `
            <div style="background:var(--card-bg); padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--accent); box-shadow: 0 0 10px rgba(0, 242, 255, 0.1);">
                <div style="flex:1; font-weight:700">${m.local}</div>
                <div style="background:var(--accent); color:black; padding:5px 12px; border-radius:6px; font-weight:900; box-shadow: 0 0 10px var(--accent);">${m.scoreL} - ${m.scoreV}</div>
                <div style="flex:1; text-align:right; font-weight:700">${m.visitante}</div>
            </div>
        `).join('')}
    </div>`;
}

function mostrarCarta(nombre) {
    const todos = data.equipos.flatMap(e => e.jugadores.map(j => ({
        ...j, 
        equipoEscudo: e.escudo,
        ovrCalculado: calcularOVR(j)
    })));
    const j = todos.find(p => p.nombre === nombre);
    if (!j) return;
    const overlay = document.createElement('div');
    overlay.className = 'perfil-overlay';
    overlay.onclick = (e) => { if(e.target === overlay) overlay.remove(); };
    overlay.innerHTML = `<div>${generarHtmlCarta(j, false)}</div>`;
    document.body.appendChild(overlay);
}

function render() {
    const cont = document.getElementById('contenido');
    if (!cont) return;
    cont.innerHTML = '';
    if (vistaActual === 'home') renderHome(cont);
    else if (vistaActual === 'jugadores') renderJugadores(cont);
    else if (vistaActual === 'dreamteam') renderDreamTeam(cont);
    else if (vistaActual === 'equipos') renderEquipos(cont);
    else if (vistaActual === 'partidos') renderPartidos(cont);
    else if (vistaActual === 'plantel') renderPlantel(cont);
}

function cambiarVista(v) { vistaActual = v; render(); }
function verPlantel(i) { equipoSeleccionado = i; vistaActual = 'plantel'; render(); }
window.onload = () => render();
