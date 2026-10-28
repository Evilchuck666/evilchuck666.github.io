const repos = [
  {
    name: "QuakeDock",
    language: "Python",
    description:
      "Instalador y lanzador multiplataforma para Quake y QuakeWorld: prepara campaña y multijugador con vkQuake y ezQuake en Windows, Linux o macOS.",
    url: "https://github.com/Evilchuck666/QuakeDock",
    topics: ["quake", "game-launcher", "pyside6"]
  },
  {
    name: "ArenaHub",
    language: "Python",
    description:
      "Instalador y lanzador de Quake III Arena: tu copia de Steam, el motor Quake3e, mods clásicos (CPMA, OSP, Rocket Arena 3, Threewave CTF) y 47 packs de mapas.",
    url: "https://github.com/Evilchuck666/ArenaHub",
    topics: ["quake-iii-arena", "game-launcher", "cross-platform"]
  },
  {
    name: "PyVideoKit",
    language: "Python",
    description:
      "Kit de vídeo basado en FFmpeg: recortes, uniones, fundidos, efecto VHS, másters FFV1 sin pérdida y exportaciones ProRes 4K para YouTube. Instala la librería, la CLI y la GUI.",
    url: "https://github.com/Evilchuck666/PyVideoKit",
    topics: ["ffmpeg", "video-processing", "meta-package"]
  },
  {
    name: "PyVideoKit-CLI",
    language: "Python",
    description:
      "Línea de comandos de PyVideoKit: todas las herramientas desde un único comando pvk, con barras de progreso de Rich.",
    url: "https://github.com/Evilchuck666/PyVideoKit-CLI",
    topics: ["cli", "click", "rich"]
  },
  {
    name: "PyVideoKit-GUI",
    language: "Python",
    description:
      "Aplicación de escritorio de PyVideoKit con PySide6: pestañas, arrastrar y soltar, procesado por lotes y progreso por archivo y total.",
    url: "https://github.com/Evilchuck666/PyVideoKit-GUI",
    topics: ["gui", "pyside6", "drag-and-drop"]
  },
  {
    name: "PyVideoKit-Libs",
    language: "Python",
    description:
      "Librería principal de PyVideoKit, sin dependencias de Python: controla FFmpeg, FFprobe y SoX con callbacks de progreso.",
    url: "https://github.com/Evilchuck666/PyVideoKit-Libs",
    topics: ["python-library", "ffmpeg-wrapper", "sox"]
  },
  {
    name: "VHSify",
    language: "Shell",
    description:
      "Convierte cualquier vídeo en una cinta VHS gastada: sangrado de color, grano, saltos de tracking y siseo de cinta. Scripts de FFmpeg y SoX para GNU/Linux, macOS y Windows.",
    url: "https://github.com/Evilchuck666/VHSify",
    topics: ["vhs", "ffmpeg", "retro"]
  },
  {
    name: "WinJitsu",
    language: "Python",
    description:
      "Ajuste animado de ventanas en Linux X11: desliza la ventana activa a mitades, cuartos, centro o pantalla completa, y entre monitores, desde tus atajos de teclado.",
    url: "https://github.com/Evilchuck666/WinJitsu",
    topics: ["x11", "window-management", "multi-monitor"]
  },
  {
    name: "KlondikeCLI",
    language: "C++",
    description:
      "Solitario Klondike para la terminal en C+\u2060+17: partidas con semilla, robar una o tres cartas, contador de movimientos y puntuación. Nació como proyecto universitario en 2016.",
    url: "https://github.com/Evilchuck666/KlondikeCLI",
    topics: ["solitaire", "terminal-game", "cpp17"]
  },
  {
    name: "MyReisinLapTimes",
    language: "C#",
    description:
      "App de escritorio para Windows que registra tiempos por vuelta con fotos y tipo de neumático, los clasifica y exporta imágenes Top 10 para compartir.",
    url: "https://github.com/Evilchuck666/MyReisinLapTimes",
    topics: ["lap-times", "leaderboard", "winforms"]
  },
  {
    name: "hide-scrollbar-youtube-firefox",
    language: "JavaScript",
    description:
      "Complemento de Firefox que oculta la barra de desplazamiento en los vídeos de YouTube para que el reproductor use todo el ancho. Sin permisos ni recogida de datos.",
    url: "https://github.com/Evilchuck666/hide-scrollbar-youtube-firefox",
    topics: ["firefox-addon", "youtube", "webextension"]
  },
  {
    name: "swift-livery-catalog",
    language: "JavaScript",
    description:
      "Web oficial de Suifuto Remon, proyecto de automoción con un Suzuki Swift Sport ZC33S: catálogo visual de diseños de vinilo.",
    url: "https://github.com/Evilchuck666/swift-livery-catalog",
    topics: ["automotive", "suzuki", "swift"]
  }
];

const repoGrid = document.getElementById("repo-grid");

function tagColor(language) {
  const palette = {
    Python: "#60a5fa",
    Shell: "#34d399",
    PowerShell: "#a78bfa",
    JavaScript: "#facc15",
    "C++": "#fb7185",
    "C#": "#22d3ee",
    CSS: "#f9a8d4",
    HTML: "#f97316"
  };

  return palette[language] || "#94a3b8";
}

repos.forEach((repo) => {
  const card = document.createElement("article");
  card.className = "repo-card";

  const top = document.createElement("div");
  top.className = "repo-top";

  const name = document.createElement("div");
  name.className = "repo-name";
  name.textContent = repo.name;

  const lang = document.createElement("span");
  lang.className = "repo-language";
  lang.textContent = repo.language;
  lang.style.borderColor = `${tagColor(repo.language)}55`;
  lang.style.color = tagColor(repo.language);
  lang.style.background = `${tagColor(repo.language)}20`;

  top.appendChild(name);
  top.appendChild(lang);

  const description = document.createElement("p");
  description.textContent = repo.description;

  const meta = document.createElement("div");
  meta.className = "repo-meta";

  const topics = document.createElement("div");
  topics.className = "repo-topics";

  (repo.topics || []).slice(0, 3).forEach((topic) => {
    const chip = document.createElement("span");
    chip.className = "repo-topic";
    chip.textContent = topic;
    topics.appendChild(chip);
  });

  const link = document.createElement("a");
  link.className = "repo-link";
  link.href = repo.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = "Repo →";

  meta.appendChild(topics);
  meta.appendChild(link);

  card.appendChild(top);
  card.appendChild(description);
  card.appendChild(meta);
  repoGrid.appendChild(card);
});
