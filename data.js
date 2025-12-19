const data = {
  equipos: [
    {
      nombre: "VillaCanto FC",
      escudo: "VillaCanto_FC.png",
      jugadores: [
        { 
          nombre: "Eric Gamarra", 
          posicion: ["DEL", "EXT", "MCO"], 
          foto: "Jugador_Generico.png",
          golesTotales: 7, 
          asistenciasTotales: 8,
          vallasInvictasTotales: 0,
          semana: { goles: 7, asistencias: 8, vallaInvicta: false, jugo: true },
          stats: { velocidad: 90, aceleracion: 80, tiro: 89, tecnica: 81, regates: 76, potencia: 93, resistencia: 77, defensa: 66 }
        },
        { 
          nombre: "Daylan Gaitan", 
          posicion: ["DEL"], 
          foto: "Jugador_Generico.png",
          golesTotales: 5, 
          asistenciasTotales: 4,
          vallasInvictasTotales: 0,
          semana: { goles: 5, asistencias: 4, vallaInvicta: false, jugo: true },
          stats: { velocidad: 91, aceleracion: 79, tiro: 85, tecnica: 77, regates: 76, potencia: 84, resistencia: 80, defensa: 77 }
        },
        { 
          nombre: "Fabricio Zapata", 
          posicion: ["MC", "EXT"], 
          foto: "Jugador_Generico.png",
          golesTotales: 3, 
          asistenciasTotales: 4,
          vallasInvictasTotales: 0,
          semana: { goles: 3, asistencias: 4, vallaInvicta: false, jugo: true },
          stats: { velocidad: 76, aceleracion: 80, tiro: 75, tecnica: 82, regates: 91, potencia: 72, resistencia: 74, defensa: 66 }
        },
        { 
          nombre: "Alan Laurito", 
          posicion: ["MC"], 
          foto: "Jugador_Generico.png",
          golesTotales: 2, 
          asistenciasTotales: 2,
          vallasInvictasTotales: 0,
          semana: { goles: 2, asistencias: 1, vallaInvicta: false, jugo: false },
          stats: { velocidad: 72, aceleracion: 76, tiro: 74, tecnica: 84, regates: 92, potencia: 70, resistencia: 76, defensa: 78 }
        },
        { 
          nombre: "Felipe Zapata", 
          posicion: ["DEF"], 
          foto: "Jugador_Generico.png",
          golesTotales: 1, 
          asistenciasTotales: 1,
          vallasInvictasTotales: 0,
          semana: { goles: 1, asistencias: 1, vallaInvicta: false, jugo: true },
          stats: { velocidad: 76, aceleracion: 75, tiro: 73, tecnica: 76, regates: 76, potencia: 69, resistencia: 72, defensa: 85 }
        },
        { 
          nombre: "Isaac Peralta", 
          posicion: ["DEF"], 
          foto: "Jugador_Generico.png",
          golesTotales: 2, 
          asistenciasTotales: 1,
          vallasInvictasTotales: 0,
          semana: { goles: 2, asistencias: 1, vallaInvicta: false, jugo: false },
          stats: { velocidad: 76, aceleracion: 75, tiro: 71, tecnica: 75, regates: 75, potencia: 77, resistencia: 78, defensa: 86 }
        },
        { 
          nombre: "Agustín Girsa", 
          posicion: ["POR"], 
          foto: "Jugador_Generico.png",
          golesTotales: 0, 
          asistenciasTotales: 0,
          vallasInvictasTotales: 10,
          semana: { goles: 0, asistencias: 0, vallaInvicta: true, jugo: true },
          stats: { velocidad: 90, aceleracion: 78, tiro: 72, tecnica: 88, regates: 76, potencia: 89, resistencia: 80, defensa: 87 }
        }
      ]
    },
    {
      nombre: "SC VillaCampi",
      escudo: "SC_VillaCampi.png",
      jugadores: [] //por ahora no hay, los agrego despues 
    }
  ],
  partidos: [
    { local: "VillaCanto FC", visitante: "SC VillaRiccio", scoreL: 20, scoreV: 12, fecha: "15 de Junio" },
  ]
};
