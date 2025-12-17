let vistaActual = 'home';
let equipoSeleccionado = null; 

function calcularRating(j) {
    let p = (j.partidos * 5) + (j.pases * 0.05);
    if (j.posicion.includes("POR")) p += (j.atajadas * 4) + (j.vallasInvictas * 30);
    else if (j.posicion.includes("DEF")) p += (j.recuperaciones * 4) + (j.goles * 15);
    else p += (j.goles * 10) + (j.asistencias * 8) + (j.recuperaciones * 2);
    return p;
}

function obtenerRanking(listaFiltrada = null) {
    let lista = [];
    if (listaFiltrada) {
        lista = listaFiltrada.map(j => ({...j, bruto: calcularRating(j)}));
    } else {
        data.equipos.forEach(e => {
            if (e.jugadores) {
                e.jugadores.forEach(j => {
                    lista.push({...j, equipo: e.nombre, bruto: calcularRating(j)});
                });
            }
        });
    }
    if (lista.length === 0) return [];
    const max = Math.max(...lista.map(j => j.bruto));
    return lista.map(j => ({...j, rating: ((j.bruto / max) * 9 + 1).toFixed(1)}))
                .sort((a,b) => b.bruto - a.bruto);
}

function generarCardsJugadores(lista) {
    let html = '<div class="cards-grid">';
    lista.forEach(j => {
        const posClase = `border-${j.posicion[0]}`; 
        html += `
        <div class="player-card ${posClase}">
            <div style="display:flex; gap:15px; align-items:center;">
                <img src="${j.foto}" class="player-photo" onerror="this.src='imagenes/Jugador_Generico.png'">
                <div style="flex:1">
                    <h3 style="margin:0">${j.nombre}</h3>
                    <div style="color:var(--accent); font-size:0.8rem; font-weight:700;">${j.equipo || ""}</div>
                    <div style="color:var(--muted); font-size:0.75rem;">${j.posicion.join(' / ')}</div>
                </div>
                <div style="font-size:1.8rem; font-weight:900; color:var(--accent)">${j.rating}</div>
            </div>
            <div class="stat-grid">
                <div class="stat-box"><span class="stat-val">${j.goles}</span><span class="stat-lab">GOL</span></div>
                <div class="stat-box"><span class="stat-val">${j.asistencias}</span><span class="stat-lab">AST</span></div>
                <div class="stat-box"><span class="stat-val">${j.posicion.includes("POR") ? j.atajadas : j.recuperaciones}</span><span class="stat-lab">${j.posicion.includes("POR") ? "ATJ" : "REC"}</span></div>
                <div class="stat-box"><span class="stat-val">${j.pases}</span><span class="stat-lab">PAS</span></div>
            </div>
        </div>`;
    });
    return html + '</div>';
}

function render() {
    const cont = document.getElementById('contenido');
    cont.innerHTML = '';

    if (vistaActual === 'home') {
        const jugadores = obtenerRanking();
        const topGoleadores = [...jugadores].sort((a,b) => b.goles - a.goles).slice(0, 3);
        const ultimoPartido = data.partidos[data.partidos.length - 1];
        const totalGoles = jugadores.reduce((acc, j) => acc + j.goles, 0);

        cont.innerHTML = `
            <div class="home-container">
                <section class="hero">
                    <h1>⚽ <span style="color:var(--accent)">PRO</span>STATS</h1>
                    <p>Panel de Control de la Liga Amateur</p>
                    <div class="quick-stats">
                        <div class="q-box"><span>${data.equipos.length}</span><label>Equipos</label></div>
                        <div class="q-box"><span>${jugadores.length}</span><label>Jugadores</label></div>
                        <div class="q-box"><span>${totalGoles}</span><label>Goles</label></div>
                    </div>
                </section>
                <div class="home-grid">
                    <div class="home-card">
                        <h3>🏆 Goleadores</h3>
                        ${topGoleadores.map((g, i) => `<div class="mini-row"><span>${i+1}. ${g.nombre}</span><b>${g.goles} G</b></div>`).join('')}
                        <button class="view-more" onclick="cambiarVista('jugadores')">Ver Todos</button>
                    </div>
                    <div class="home-card">
                        <h3>📅 Último Resultado</h3>
                        ${ultimoPartido ? `
                            <div class="match-mini">
                                <div class="m-team">${ultimoPartido.local}</div>
                                <div class="m-score">${ultimoPartido.scoreL}-${ultimoPartido.scoreV}</div>
                                <div class="m-team">${ultimoPartido.visitante}</div>
                            </div>
                        ` : '<p>No hay datos.</p>'}
                        <button class="view-more" onclick="cambiarVista('partidos')">Ver Fixture</button>
                    </div>
                </div>
            </div>`;
    }

    if (vistaActual === 'jugadores') {
        cont.innerHTML = generarCardsJugadores(obtenerRanking());
    }

    if (vistaActual === 'dreamteam') {
        const jugadores = obtenerRanking();
        const slots = [
            { t: 88, l: 50, roles: ["POR"] }, { t: 72, l: 30, roles: ["DEF"] }, { t: 72, l: 70, roles: ["DEF"] },
            { t: 52, l: 50, roles: ["MC"] }, { t: 36, l: 50, roles: ["MCO"] },
            { t: 22, l: 18, roles: ["EXT"] }, { t: 22, l: 82, roles: ["EXT"] }, { t: 10, l: 50, roles: ["DEL"] } 
        ];
        let html = '<div class="pitch"><div class="pitch-line-center"></div><div class="pitch-circle"></div>';
        let usados = new Set();
        slots.forEach(s => {
            const el = jugadores.find(j => j.posicion.some(p => s.roles.includes(p)) && !usados.has(j.nombre));
            if (el) { 
                usados.add(el.nombre); 
                html += `<div class="tactical-card" style="top:${s.t}%; left:${s.l}%; transform:translateX(-50%);">
                    <div class="rating">${el.rating}</div>
                    <div class="name" style="font-size:0.7rem">${el.nombre.split(' ')[0]}</div>
                    <div class="pos-tag" style="font-size:0.5rem; color:var(--muted)">${s.roles[0]}</div>
                </div>`; 
            }
        });
        cont.innerHTML = html + '</div>';
    }

    if (vistaActual === 'equipos') {
        let html = '<div class="cards-grid">';
        data.equipos.forEach((e, index) => {
            html += `<div class="team-card" onclick="verPlantel(${index})">
                <img src="${e.escudo}" style="width:70px;" onerror="this.src='imagenes/equipo_generico.jpg'">
                <div><h2 style="margin:0">${e.nombre}</h2><p style="color:var(--muted); margin:0">Plantel: ${e.jugadores.length} jugadores</p></div>
            </div>`;
        });
        cont.innerHTML = html + '</div>';
    }

    if (vistaActual === 'plantel') {
        const equipo = data.equipos[equipoSeleccionado];
        cont.innerHTML = `
            <div style="padding: 20px;">
                <button onclick="cambiarVista('equipos')" class="nav-btn" style="margin-bottom:20px;">← Equipos</button>
                <div class="team-header-box">
                    <img src="${equipo.escudo}" style="width:80px;" onerror="this.src='imagenes/equipo_generico.jpg'">
                    <div><h1>${equipo.nombre}</h1><p>Plantel Completo</p></div>
                </div>
                ${generarCardsJugadores(obtenerRanking(equipo.jugadores))}
            </div>`;
    }

    if (vistaActual === 'partidos') {
        let html = '<div class="match-list">';
        data.partidos.forEach(m => {
            html += `<div class="match-card">
                <div class="match-date">${m.fecha}</div>
                <div class="match-row">
                    <div class="match-team local">${m.local}</div>
                    <div class="match-score">${m.scoreL} - ${m.scoreV}</div>
                    <div class="match-team visitante">${m.visitante}</div>
                </div>
            </div>`;
        });
        cont.innerHTML = html + '</div>';
    }
}

function verPlantel(i) { equipoSeleccionado = i; vistaActual = 'plantel'; render(); }
function cambiarVista(v) {
    vistaActual = v; equipoSeleccionado = null;
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    render();
}
window.onload = render;