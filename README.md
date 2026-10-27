![Platform](https://img.shields.io/badge/platform-Web-blue)
![Requires](https://img.shields.io/badge/requires-modern%20browser-blue)
[![License](https://img.shields.io/badge/license-GPLv3-green)](LICENSE)

const repos = [
  {
    name: "QuakeDock",
    language: "Python",
    description:
      "Instalador y lanzador multiplataforma para Quake y QuakeWorld con soporte para vkQuake y ezQuake.",
    url: "https://github.com/Evilchuck666/QuakeDock",
    topics: ["cross-platform", "game-launcher", "quake", "pyside6"]
  },
  {
    name: "ArenaHub",
    language: "Python",
    description:
      "Proyecto personal en Python sin descripción pública. Una base para ideas y utilidades relacionadas con producto digital.",
    url: "https://github.com/Evilchuck666/ArenaHub",
    topics: ["python", "project", "apps"]
  },
  {
    name: "PyVideoKit",
    language: "Shell",
    description:
      "Repositorio principal del conjunto de herramientas de video y automatización multimedia creadas por Evilchuck666.",
    url: "https://github.com/Evilchuck666/PyVideoKit",
    topics: ["video", "toolkit", "ffmpeg"]
  },
  {
    name: "PyVideoKit-CLI",
    language: "Python",
    description:
      "Versión en línea de comandos del proyecto PyVideoKit para tareas rápidas y scripting.",
    url: "https://github.com/Evilchuck666/PyVideoKit-CLI",
    topics: ["cli", "python", "automation"]
  },
  {
    name: "PyVideoKit-GUI",
    language: "Python",
    description:
      "Interfaz gráfica para el ecosistema de PyVideoKit, orientada a usuarios que prefieran una experiencia visual.",
    url: "https://github.com/Evilchuck666/PyVideoKit-GUI",
    topics: ["gui", "desktop", "python"]
  },
  {
    name: "PyVideoKit-Libs",
    language: "Python",
    description:
      "Librerías y componentes reutilizables para apoyar el conjunto de herramientas de edición y tratamiento multimedia.",
    url: "https://github.com/Evilchuck666/PyVideoKit-Libs",
    topics: ["libraries", "python", "media"]
  },
  {
    name: "swift-livery-catalog",
    language: "Python",
    description:
      "Sitio web oficial para Suifuto Remon, un proyecto de automoción del Suzuki Swift Sport ZC33S.",
    url: "https://github.com/Evilchuck666/swift-livery-catalog",
    topics: ["automotive", "cars", "suzuki", "swift"]
  },
  {
    name: "WinJitsu",
    language: "Python",
    description:
      "Proyecto personal centrado en utilidades, ajustes y automatizaciones para entornos Windows.",
    url: "https://github.com/Evilchuck666/WinJitsu",
    topics: ["windows", "automation", "tools"]
  },
  {
    name: "vhs-ffmpeg-script",
    language: "PowerShell",
    description:
      "Aplica un estilo VHS tanto al vídeo como al audio usando FFmpeg y SoX.",
    url: "https://github.com/Evilchuck666/vhs-ffmpeg-script",
    topics: ["ffmpeg", "vhs", "audio", "video"]
  }
];

const repoGrid = document.getElementById("repo-grid");

function tagColor(language) {
  const palette = {
    Python: "#60a5fa",
    Shell: "#34d399",
    PowerShell: "#a78bfa",
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
