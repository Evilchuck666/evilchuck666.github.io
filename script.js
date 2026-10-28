const repos = [
  {
    name: "QuakeDock",
    language: "Python",
    description:
      "Cross-platform installer and launcher for Quake and QuakeWorld: set up campaign and multiplayer with vkQuake and ezQuake on Windows, Linux or macOS.",
    url: "https://github.com/Evilchuck666/QuakeDock",
    topics: ["quake", "game-launcher", "pyside6"]
  },
  {
    name: "ArenaHub",
    language: "Python",
    description:
      "Installer and launcher for Quake III Arena: your Steam copy, the Quake3e engine, classic mods (CPMA, OSP, Rocket Arena 3, Threewave CTF) and 47 map packs.",
    url: "https://github.com/Evilchuck666/ArenaHub",
    topics: ["quake-iii-arena", "game-launcher", "cross-platform"]
  },
  {
    name: "PyVideoKit",
    language: "Python",
    description:
      "FFmpeg-based video toolkit: trim, concatenate, fade, VHS effect, lossless FFV1 masters and 4K ProRes exports for YouTube. Installs the library, the CLI and the GUI.",
    url: "https://github.com/Evilchuck666/PyVideoKit",
    topics: ["ffmpeg", "video-processing", "meta-package"]
  },
  {
    name: "PyVideoKit-CLI",
    language: "Python",
    description:
      "Command-line interface for PyVideoKit: every tool from a single pvk command, with Rich progress bars.",
    url: "https://github.com/Evilchuck666/PyVideoKit-CLI",
    topics: ["cli", "click", "rich"]
  },
  {
    name: "PyVideoKit-GUI",
    language: "Python",
    description:
      "PySide6 desktop app for PyVideoKit: tabs, drag-and-drop, batch processing, and per-file and overall progress.",
    url: "https://github.com/Evilchuck666/PyVideoKit-GUI",
    topics: ["gui", "pyside6", "drag-and-drop"]
  },
  {
    name: "PyVideoKit-Libs",
    language: "Python",
    description:
      "Core library behind PyVideoKit, with zero Python dependencies: drives FFmpeg, FFprobe and SoX with progress callbacks.",
    url: "https://github.com/Evilchuck666/PyVideoKit-Libs",
    topics: ["python-library", "ffmpeg-wrapper", "sox"]
  },
  {
    name: "VHSify",
    language: "Shell",
    description:
      "Turn any video into a worn-out VHS tape: chroma bleed, grain, tracking jitter and tape hiss. FFmpeg and SoX scripts for GNU/Linux, macOS and Windows.",
    url: "https://github.com/Evilchuck666/VHSify",
    topics: ["vhs", "ffmpeg", "retro"]
  },
  {
    name: "WinJitsu",
    language: "Python",
    description:
      "Animated window snapping for Linux X11: glide the active window to halves, quarters, center or fullscreen, and across monitors, from your hotkeys.",
    url: "https://github.com/Evilchuck666/WinJitsu",
    topics: ["x11", "window-management", "multi-monitor"]
  },
  {
    name: "KlondikeCLI",
    language: "C++",
    description:
      "Klondike solitaire for the terminal in C+\u2060+17: seeded deals, draw one or three, move counter and scoring. Originally a 2016 university project.",
    url: "https://github.com/Evilchuck666/KlondikeCLI",
    topics: ["solitaire", "terminal-game", "cpp17"]
  },
  {
    name: "MyReisinLapTimes",
    language: "C#",
    description:
      "Windows desktop app to log lap times with photos and tire type, rank them in leaderboards and export shareable Top 10 images.",
    url: "https://github.com/Evilchuck666/MyReisinLapTimes",
    topics: ["lap-times", "leaderboard", "winforms"]
  },
  {
    name: "hide-scrollbar-youtube-firefox",
    language: "JavaScript",
    description:
      "Firefox add-on that hides the scrollbar on YouTube video pages so the player uses the full window width. No permissions, no data collection.",
    url: "https://github.com/Evilchuck666/hide-scrollbar-youtube-firefox",
    topics: ["firefox-addon", "youtube", "webextension"]
  },
  {
    name: "swift-livery-catalog",
    language: "JavaScript",
    description:
      "Official website for Suifuto Remon, a Suzuki Swift Sport ZC33S automotive project: a visual catalogue of vinyl livery designs.",
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
