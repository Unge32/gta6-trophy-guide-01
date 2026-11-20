// Leonida Platinum — boot, filters, views and the trophy detail pane.
// Data: app/data/trophies.json (the 55 official trophies) and
// app/data/roadmap.json (the five platinum stages). No network at run time:
// the only fetch is these two files from the app's own server.
import { loadEarned, saveEarned, loadSettings, saveSettings, exportFile, importFile } from './store.js';

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = {
  platinum: 'Platinum', story: 'Story', side: 'Side mission', activity: 'Activity',
  collectible: 'Collectible', combat: 'Combat & heist', world: 'Open world',
  money: 'Money & property', completion: '100% completion',
};

const data = await (await fetch('data/trophies.json')).json();
const roadmap = await (await fetch('data/roadmap.json')).json();
const trophies = [...data.trophies].sort((a, b) => a.id - b.id);
const byId = new Map(trophies.map((t) => [t.id, t]));

let earned = loadEarned();
let settings = loadSettings({ spoilers: true, showGuides: true, theme: 'night' });
let selectedId = null;

const $ = (id) => document.getElementById(id);
const els = {
  rows: $('rows'), detail: $('detail'), empty: $('empty'), listMeta: $('list-meta'),
  earnedCount: $('earned-count'), progressFill: $('progress-fill'), progressBar: $('progress-bar'),
  gradeCounts: $('grade-counts'), search: $('search'), grade: $('grade'), kind: $('kind'),
  status: $('status'), spoilers: $('spoilers'), guides: $('guides'), theme: $('theme'),
  stages: $('stages'), missableRows: $('missable-rows'), controls: $('controls'),
};

function isHiddenBySpoilers(t) {
  return settings.spoilers && t.kind === 'story' && !earned.has(t.id);
}

function medalDot(t) {
  const s = document.createElement('span');
  s.className = `medal ${t.grade}`;
  s.textContent = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' }[t.grade];
  s.title = GRADE_LABEL[t.grade];
  return s;
}

function trophyRow(t) {
  const li = document.createElement('li');
  li.className = `trophy grade-${t.grade}${earned.has(t.id) ? ' earned' : ''}${t.missable ? ' missable' : ''}`;
  if (selectedId === t.id) li.classList.add('selected');

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', `Earned: ${t.name}`);
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned(earned);
    renderAll();
  });

  const body = document.createElement('div');
  body.className = 'trophy-body';
  const name = document.createElement('button');
  name.type = 'button';
  name.className = 'trophy-name';
  name.textContent = isHiddenBySpoilers(t) ? 'Hidden story trophy — earn it to reveal' : t.name;
  name.addEventListener('click', () => {
    selectedId = t.id;
    location.hash = `#/trophy/${t.id}`;
    renderAll();
  });
  body.append(name);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isHiddenBySpoilers(t)
    ? 'Story trophy — its name and description stay hidden until you earn it.'
    : t.description;
  body.append(desc);

  const tags = document.createElement('p');
  tags.className = 'tags';
  const gradeTag = document.createElement('span');
  gradeTag.className = `tag grade-tag ${t.grade}`;
  gradeTag.textContent = GRADE_LABEL[t.grade];
  tags.append(gradeTag);
  if (t.kind !== 'platinum') {
    const kindTag = document.createElement('span');
    kindTag.className = 'tag';
    kindTag.textContent = KIND_LABEL[t.kind] ?? t.kind;
    tags.append(kindTag);
  }
  if (t.count) {
    const countTag = document.createElement('span');
    countTag.className = 'tag count';
    countTag.textContent = `PSN tracks: ${t.count.toLocaleString('en-US')} ${t.target ?? ''}`.trim();
    tags.append(countTag);
  }
  if (t.missable) {
    const missTag = document.createElement('span');
    missTag.className = 'tag missable-tag';
    missTag.textContent = '⚠ Missable';
    tags.append(missTag);
  }
  body.append(tags);

  if (settings.showGuides && !isHiddenBySpoilers(t)) {
    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    guide.textContent = t.guide;
    body.append(guide);
    const src = document.createElement('p');
    src.className = 'trophy-sources';
    src.textContent = `Sources: ${t.sources}`;
    body.append(src);
  }

  li.append(box, medalDot(t), body);
  return li;
}

function visibleTrophies() {
  const q = els.search.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (els.grade.value !== 'all' && t.grade !== els.grade.value) return false;
    if (els.kind.value === 'missable') {
      if (!t.missable) return false;
    } else if (els.kind.value !== 'all' && t.kind !== els.kind.value) {
      return false;
    }
    if (els.status.value === 'earned' && !earned.has(t.id)) return false;
    if (els.status.value === 'missing' && earned.has(t.id)) return false;
    if (q && !(t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q)) return false;
    return true;
  });
}

function renderProgress() {
  const n = earned.size;
  els.earnedCount.textContent = n;
  els.progressFill.style.width = `${(n / trophies.length) * 100}%`;
  els.progressBar.setAttribute('aria-valuenow', String(n));
  els.progressBar.setAttribute('aria-valuemax', String(trophies.length));
  els.gradeCounts.textContent = Object.keys(GRADE_LABEL)
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const got = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      return `${GRADE_LABEL[g]} ${got}/${total}`;
    })
    .join(' · ');
}

function renderList() {
  const list = visibleTrophies();
  els.rows.replaceChildren(...list.map(trophyRow));
  els.empty.hidden = list.length > 0;
  els.listMeta.textContent = `Showing ${list.length} of 55 trophies — ${earned.size} earned (${Math.round((earned.size / 55) * 100)}%). Tick a trophy when you earn it; progress is saved in this browser.`;
}

function renderDetail() {
  const t = selectedId ? byId.get(selectedId) : null;
  if (!t) {
    els.detail.innerHTML = '';
    const h = document.createElement('h2');
    h.textContent = 'Pick a trophy for its full guide';
    const p = document.createElement('p');
    p.textContent = 'Click any trophy name in the list to open its guide here: what to do, where and when, whether it can be missed, the count PlayStation tracks, and the sources each fact comes from.';
    const p2 = document.createElement('p');
    p2.className = 'detail-note';
    p2.textContent = 'Guides are written from the official descriptions and PSN counts — exact in-game locations are not yet verified in play, and the guide says so where a step is not pinned down.';
    els.detail.append(h, p, p2);
    return;
  }
  els.detail.innerHTML = '';
  const hidden = isHiddenBySpoilers(t);
  const h = document.createElement('h2');
  h.textContent = hidden ? 'Hidden story trophy' : t.name;
  const meta = document.createElement('p');
  meta.className = 'detail-meta';
  meta.textContent = `${GRADE_LABEL[t.grade]} · ${KIND_LABEL[t.kind] ?? t.kind}${t.missable ? ' · ⚠ Missable' : ''}${t.count ? ` · PSN tracks: ${t.count.toLocaleString('en-US')} ${t.target ?? ''}`.trim() : ''}`;
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = hidden ? 'Story trophy — its name and description stay hidden until you earn it.' : t.description;
  const guide = document.createElement('p');
  guide.className = 'detail-guide';
  guide.textContent = hidden ? 'Turn the spoiler setting off, or earn this trophy, to read its guide.' : t.guide;
  const src = document.createElement('p');
  src.className = 'trophy-sources';
  src.textContent = hidden ? '' : `Sources: ${t.sources}`;
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'back';
  back.textContent = '← Back to the list';
  back.addEventListener('click', () => {
    selectedId = null;
    location.hash = '#/checklist';
    renderAll();
  });
  els.detail.append(h, meta, desc, guide, src, back);
}

function renderRoadmap() {
  els.stages.replaceChildren();
  for (const stage of roadmap.stages) {
    const li = document.createElement('li');
    li.className = 'stage';
    const got = stage.ids.filter((id) => earned.has(id)).length;
    const h = document.createElement('h3');
    h.textContent = `Stage ${stage.n} — ${stage.title} (${got}/${stage.ids.length})`;
    const bar = document.createElement('div');
    bar.className = 'bar small';
    const fill = document.createElement('div');
    fill.className = 'fill';
    fill.style.width = `${(got / stage.ids.length) * 100}%`;
    bar.append(fill);
    const p = document.createElement('p');
    p.textContent = stage.blurb;
    const names = document.createElement('ul');
    names.className = 'stage-trophies';
    for (const id of stage.ids) {
      const t = byId.get(id);
      const item = document.createElement('li');
      item.className = earned.has(id) ? 'done' : '';
      const a = document.createElement('a');
      a.href = `#/trophy/${id}`;
      a.textContent = `${earned.has(id) ? '✓ ' : ''}${isHiddenBySpoilers(t) ? 'Hidden story trophy' : t.name} (${GRADE_LABEL[t.grade]})${t.missable ? ' ⚠' : ''}`;
      item.append(a);
      names.append(item);
    }
    li.append(h, bar, p, names);
    els.stages.append(li);
  }
}

function renderMissables() {
  const list = trophies.filter((t) => t.missable);
  els.missableRows.replaceChildren(...list.map(trophyRow));
}

function showView(name) {
  for (const view of document.querySelectorAll('.view')) view.hidden = true;
  const view = $('view-' + (name === 'trophy' ? 'checklist' : name));
  if (view) view.hidden = false;
  for (const tab of document.querySelectorAll('.tabs a')) {
    tab.classList.toggle('active', tab.dataset.tab === (name === 'trophy' ? 'checklist' : name));
  }
  els.controls.style.display = name === 'checklist' || name === 'trophy' ? '' : 'none';
}

function route() {
  const hash = location.hash || '#/checklist';
  const m = hash.match(/^#\/trophy\/(\d+)$/);
  if (m && byId.has(Number(m[1]))) {
    selectedId = Number(m[1]);
    showView('trophy');
  } else {
    const name = ['checklist', 'roadmap', 'missables', 'sources'].includes(hash.slice(2)) ? hash.slice(2) : 'checklist';
    if (name !== 'checklist') selectedId = null;
    showView(name);
  }
  renderAll();
}

function renderAll() {
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

function applySettings() {
  document.documentElement.dataset.theme = settings.theme;
  els.theme.textContent = settings.theme === 'night' ? 'Light theme' : 'Dark theme';
  els.spoilers.checked = settings.spoilers;
  els.guides.checked = settings.showGuides;
}

els.search.addEventListener('input', renderList);
els.grade.addEventListener('change', renderList);
els.kind.addEventListener('change', renderList);
els.status.addEventListener('change', renderList);
els.spoilers.addEventListener('change', () => {
  settings.spoilers = els.spoilers.checked;
  saveSettings(settings);
  renderAll();
});
els.guides.addEventListener('change', () => {
  settings.showGuides = els.guides.checked;
  saveSettings(settings);
  renderList();
});
els.theme.addEventListener('click', () => {
  settings.theme = settings.theme === 'night' ? 'paper' : 'night';
  saveSettings(settings);
  applySettings();
});
$('export').addEventListener('click', () => exportFile(earned));
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const next = await importFile(file);
    earned = new Set([...next].filter((id) => byId.has(id)));
    saveEarned(earned);
    renderAll();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  e.target.value = '';
});
$('reset').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? Export first if you want a backup.')) {
    earned = new Set();
    saveEarned(earned);
    renderAll();
  }
});
window.addEventListener('hashchange', route);

applySettings();
route();
