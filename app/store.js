// Progress store: which trophies the reader has earned, saved in localStorage
// and exportable to / importable from a JSON file. Everything stays in the
// browser; nothing is sent anywhere.
export const PROGRESS_KEY = 'leonida-platinum-progress-v1';
export const SETTINGS_KEY = 'leonida-platinum-settings-v1';

export function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings(defaults) {
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportFile(earned) {
  const payload = {
    app: 'Leonida Platinum — GTA VI trophy tracker',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importFile(file) {
  const data = JSON.parse(await file.text());
  const ids = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(ids)) throw new Error('not a progress file');
  return new Set(ids.filter((n) => Number.isInteger(n)));
}
