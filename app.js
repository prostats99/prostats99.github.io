let vistaActual = 'home';
let equipoSeleccionado = null;
let filtroJugadores = 'semana';

// --- LÓGICA DE CARTAS Y GRL ---

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

function calcularOVR(j) {
    const f = calcularStatsFIFA(j);
    const pos = j.posicion[0];
    let grl = 75;
    if (pos === "DEL" || pos === "EXT") grl = (f.SHO * 0.45 + f.PAC * 0.3 + f.DRI * 0.25);
    else if (pos === "MC" || pos === "MCO") grl = (f.PAS * 0.4 + f.DRI * 0.35 + f.PHY * 0.25);
    else if (pos === "DEF") grl = (f.DEF * 0.6 + f.PHY * 0.3 + f.PAC * 0.1);
    else if (pos === "POR") grl = (f.DEF * 0.75 + f.PHY * 0.25);
    return Math.min(99, Math.round(grl));
}

function obtenerRanking(listaFiltrada = null, modoHistorico = false) {
    const fuente = listaFiltrada || data.equipos.flatMap(e => e.jugadores.map(j => ({...j, equipo: e.nombre, escudo: e.escudo})));
    return fuente.map(j => ({ ...j, rating: calcularOVR(j) })).sort((a,b) => b.rating - a.rating);
}

function obtenerFotoJugador(j) {
    if (j.foto && j.foto !== "Jugador_Generico.png" && j.foto !== "") return j.foto;
    if (j.posicion.includes("POR")) return "arquero_pose.png";
    const seed = j.nombre.length % 3 + 1; 
    return `pose_${seed}.png`;
}

function generarHtmlCarta(j, esMini = false) {
    const ovr = calcularOVR(j);
    const f = calcularStatsFIFA(j);
    const rareza = ovr >= 85 ? 'especial' : (ovr >= 75 ? 'oro' : 'plata');
    const colorPos = `var(--color-${j.posicion[0]})`;
    const escudoClub = j.escudo || data.equipos.find(e => e.jugadores.some(p => p.nombre === j.nombre))?.escudo;
    const fotoFinal = obtenerFotoJugador(j);

    // CAPRICHO: Clase 'elite-glow' para cracks con GRL 88+
    const glowClass = ovr >= 88 ? 'elite-glow' : '';

    if (esMini) {
        return `
        <div class="fut-card-rect mini card-${rareza} ${glowClass}" style="border-top-color:${colorPos}">
            <div class="card-top">
                <div class="ovr-badge">
                    <span class="val" style="color:${colorPos}">${ovr}</span>
                    <span class="pos">${j.posicion[0]}</span>
                    <img src="${escudoClub}" class="mini-club-badge" onerror="this.src='VillaCanto_FC.png'">
                </div>
                <img src="${fotoFinal}" class="player-img-full" onerror="this.src='Jugador_Generico.png'">
            </div>
            <div class="card-bottom" style="background:${colorPos}; color: black;">
                <div class="p-name">${j.nombre.split(' ').pop()}</div>
                <div class="mini-stats-row">
                    <span>⚽ ${j.semana.goles}</span>
                    <span>👟 ${j.semana.asistencias}</span>
                </div>
            </div>
        </div>`;
    }

    return `
        <div class="fut-card-rect card-${rareza} ${glowClass}" style="border-top: 4px solid ${colorPos}">
            <div class="card-top">
                <div class="ovr-badge">
                    <span class="val" style="color:${colorPos}">${ovr}</span>
                    <span class="pos">${j.posicion[0]}</span>
                </div>
                <img src="${escudoClub}" style="position:absolute; top:15px; right:15px; width:45px; filter:drop-shadow(0 0 10px black);" onerror="this.src='VillaCanto_FC.png'">
                <img src="${fotoFinal}" class="player-img-full" onerror="this.src='Jugador_Generico.png'">
            </div>
            <div class="card-bottom">
                <div class="p-name">${j.nombre}</div>
                <div class="stats-grid">
                    <div class="stat-item"><span>${f.PAC}</span> PAC</div>
                    <div class="stat-item"><span>${f.DRI}</span> DRI</div>
                    <div class="stat-item"><span>${f.SHO}</span> SHO</div>
                    <div class="stat-item"><span>${f.DEF}</span> DEF</div>
                    <div class="stat-item"><span>${f.PAS}</span> PAS</div>
                    <div class="stat-item"><span>${f.PHY}</span> PHY</div>
                </div>
            </div>
        </div>`;
}

function mostrarCarta(nombre) {
    const todos = data.equipos.flatMap(e => e.jugadores);
    const j = todos.find(p => p.nombre === nombre);
    if (!j) return;
    const overlay = document.createElement('div');
    overlay.className = 'perfil-overlay';
    // Animación de entrada
    overlay.style.animation = "fadeIn 0.3s ease";
    overlay.onclick = (e) => { 
        if(e.target === overlay) {
            overlay.remove(); 
        }
    };
    overlay.innerHTML = generarHtmlCarta(j, false);
    document.body.appendChild(overlay);
}

// --- RENDER VISTAS ---

function render() {
    const cont = document.getElementById('contenido');
    if (!cont) return;
    
    // Smooth transition
    cont.style.opacity = '0';
    setTimeout(() => {
        cont.innerHTML = '';
        cont.style.opacity = '1';
        construirVista(cont);
    }, 150);

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick')?.includes(vistaActual)) btn.classList.add('active');
    });
}

// Separé la construcción de la vista para manejar la animación
function construirVista(cont) {
    if (vistaActual === 'home') {
        const top3 = obtenerRanking().slice(0, 3);
        const ultimo = data.partidos ? data.partidos[data.partidos.length - 1] : null;
        cont.innerHTML = `
            <div style="padding: 20px; max-width: 800px; margin: auto; animation: fadeInUp 0.5s ease;">
                <h1 style="text-align: center; font-size: 2.5rem; margin-bottom:40px;">⚽ <span style="color:var(--accent)">PRO</span>STATS</h1>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1);">
                        <h3 style="margin:0 0 15px 0; color:var(--accent); font-size: 0.8rem; text-transform: uppercase;">🏆 Top Global</h3>
                        ${top3.map((j, i) => `<div style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid rgba(255,255,255,0.05);"><span>#${i+1} ${j.nombre}</span><span style="font-weight:900; color:var(--accent)">${j.rating}</span></div>`).join('')}
                    </div>
                    <div style="background: var(--card-bg); padding: 20px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.1); text-align:center;">
                        <h3 style="margin:0 0 15px 0; color:var(--accent); font-size: 0.8rem; text-transform: uppercase;">📅 Último Partido</h3>
                        ${ultimo ? `<div style="display:flex; align-items:center; justify-content:center; gap:15px;"><small>${ultimo.local}</small> <span style="background:var(--accent); color:black; padding:2px 8px; border-radius:4px; font-weight:900">${ultimo.scoreL}-${ultimo.scoreV}</span> <small>${ultimo.visitante}</small></div>` : 'No hay datos'}
                    </div>
                </div>
                <div class="cards-grid" style="margin-top: 20px;">
                    <div class="player-card" onclick="cambiarVista('jugadores')" style="text-align:center; border-top-color: var(--accent)"><h3>👤 Jugadores</h3></div>
                    <div class="player-card" onclick="cambiarVista('partidos')" style="text-align:center; border-top-color: var(--accent)"><h3>📅 Resultados</h3></div>
                </div>
            </div>`;
    }

    if (vistaActual === 'jugadores') {
        const esH = filtroJugadores === 'historico';
        const lista = obtenerRanking(null, esH);
        let html = `
            <div style="text-align:center; padding:20px; animation: fadeIn 0.5s ease;">
                <button class="nav-btn ${!esH?'active':''}" onclick="filtroJugadores='semana'; render()">SEMANA</button>
                <button class="nav-btn ${esH?'active':''}" onclick="filtroJugadores='historico'; render()">HISTÓRICO</button>
            </div><div class="cards-grid">`;
        
        lista.forEach(j => {
            const color = `var(--color-${j.posicion[0]})`;
            html += `
            <div class="player-card" style="border-top: 4px solid ${color}" onclick="mostrarCarta('${j.nombre}')">
                <div style="display:flex; align-items:center; gap:15px">
                    <img src="${obtenerFotoJugador(j)}" style="width:50px; height:50px; border-radius:12px; object-fit:cover; background: #000" onerror="this.src='Jugador_Generico.png'">
                    <div style="flex:1">
                        <h3 style="margin:0; font-size:1.1rem;">${j.nombre}</h3>
                        <div class="player-mini-stats"><span>⚽ ${esH?j.golesTotales:j.semana.goles}</span><span>👟 ${esH?j.asistenciasTotales:j.semana.asistencias}</span></div>
                    </div>
                    <div style="font-size:1.8rem; font-weight:900; color:${color}">${j.rating}</div>
                </div>
            </div>`;
        });
        cont.innerHTML = html + '</div>';
    }

    if (vistaActual === 'dreamteam') {
        const r = obtenerRanking();
        const coords = [
            { t: "88%", l: "50%" }, { t: "68%", l: "25%" }, { t: "68%", l: "75%" },
            { t: "42%", l: "28%" }, { t: "42%", l: "72%" }, { t: "15%", l: "50%" }
        ];
        let html = '<div class="field-container"><div class="field"><div class="area-grande-top"></div><div class="area-grande-bottom"></div>';
        let seleccionados = new Set(); const dream = [];
        const agregar = (f) => { const enc = r.find(j => f(j) && !seleccionados.has(j.nombre)); if (enc) { seleccionados.add(enc.nombre); dream.push(enc); } };
        
        agregar(j => j.posicion.includes('POR')); 
        agregar(j => j.posicion.includes('DEF')); agregar(j => j.posicion.includes('DEF'));
        agregar(j => j.posicion.includes('MC') || j.posicion.includes('MCO')); agregar(j => j.posicion.includes('MC') || j.posicion.includes('MCO'));
        agregar(j => j.posicion.includes('DEL') || j.posicion.includes('EXT'));
        
        dream.forEach((j, i) => {
            const pos = coords[i];
            html += `<div class="tactical-node" style="top:${pos.t}; left:${pos.l};" onclick="mostrarCarta('${j.nombre}')">${generarHtmlCarta(j, true)}</div>`;
        });
        cont.innerHTML = html + '</div></div>';
    }

    if (vistaActual === 'equipos') {
        let html = '<div class="cards-grid">';
        data.equipos.forEach((e, i) => {
            const totalGoles = e.jugadores.reduce((sum, j) => sum + j.golesTotales, 0);
            const promOvr = e.jugadores.length ? Math.round(e.jugadores.reduce((sum, j) => sum + calcularOVR(j), 0) / e.jugadores.length) : 0;
            
            html += `
            <div class="player-card team-card-large" onclick="verPlantel(${i})">
                <div class="team-card-header">
                    <img src="${e.escudo}" class="team-card-logo" onerror="this.src='VillaCanto_FC.png'">
                    <div class="team-ovr-pill">AVG ${promOvr}</div>
                </div>
                <h2 style="margin:15px 0 5px 0; font-size:1.6rem; color:var(--accent)">${e.nombre}</h2>
                <div class="team-stats-row">
                    <div class="t-stat"><span>${e.jugadores.length}</span><small>PIBES</small></div>
                    <div class="t-stat"><span>${totalGoles}</span><small>GOLES</small></div>
                </div>
                <button class="view-team-btn">VER PLANTEL</button>
            </div>`;
        });
        cont.innerHTML = html + '</div>';
    }

    if (vistaActual === 'plantel') {
        const eq = data.equipos[equipoSeleccionado];
        let html = `
            <div class="plantel-view-container">
                <button class="nav-btn" onclick="cambiarVista('equipos')" style="margin-bottom:20px">← VOLVER A EQUIPOS</button>
                
                <div class="plantel-header">
                    <img src="${eq.escudo}" onerror="this.src='VillaCanto_FC.png'">
                    <h1>${eq.nombre.toUpperCase()}</h1>
                    <div style="color:var(--accent); font-weight:800; letter-spacing:3px; margin-top:5px; opacity:0.8;">
                        PLANTEL OFICIAL 2025
                    </div>
                </div>

                <div class="plantel-grid">`;
        
        eq.jugadores.forEach((j, index) => {
            html += `
                <div class="mini-card-wrapper" 
                     onclick="mostrarCarta('${j.nombre}')" 
                     style="animation: fadeInUp 0.5s ease forwards; animation-delay: ${index * 0.05}s; opacity: 0;">
                    ${generarHtmlCarta(j, true)}
                </div>`;
        });

        html += `</div></div>`;
        cont.innerHTML = html;
    }

    if (vistaActual === 'partidos') {
        let html = '<div style="padding:20px; max-width:600px; margin:auto; animation: slideDown 0.5s ease;">';
        [...data.partidos].reverse().forEach(m => {
            html += `
            <div style="background:var(--card-bg); padding:15px; border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--accent); box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                <div style="flex:1; font-weight:700">${m.local}</div>
                <div style="background:var(--accent); color:black; padding:5px 12px; border-radius:6px; font-weight:900; margin:0 10px;">${m.scoreL} - ${m.scoreV}</div>
                <div style="flex:1; text-align:right; font-weight:700">${m.visitante}</div>
            </div>`;
        });
        cont.innerHTML = html + '</div>';
    }
}

function verPlantel(i) { equipoSeleccionado = i; vistaActual = 'plantel'; render(); }
function cambiarVista(v) { 
    vistaActual = v; 
    equipoSeleccionado = null; 
    render(); 
    window.scrollTo(0,0); 
}

window.onload = () => render();
