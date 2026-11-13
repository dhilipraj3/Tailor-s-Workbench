// Everything the app remembers on this device: people, projects, preferences.
import { SHIRT_SIZES, waistPreset } from '../engine/sizes';
import { S } from './state.js';

const KEY = 'tw.store.v3';
export const uid = () => Math.random().toString(36).slice(2, 9);
const COLORS = ['#4f86d1', '#e07a3f', '#2b8a57', '#b04fc2', '#d4a20b', '#d1495b'];

export function newPerson(name = 'Me', i = 0) {
  return { id: uid(), name, color: COLORS[i % COLORS.length], shirtSize: 'L', waist: 34, m: { ...SHIRT_SIZES.L, ...waistPreset(34) } };
}

function load() {
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && Array.isArray(s.profiles) && s.profiles.length) return s; } catch (e) { /* first run */ }
  return { unit: 'in', voice: true, profiles: [newPerson('Me')], projects: [] };
}

export const store = load();
S.unit = store.unit;

export function save() {
  S.unit = store.unit;
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* storage full or blocked */ }
}

export const person = (id) => store.profiles.find((p) => p.id === id) || store.profiles[0];
export const project = (id) => store.projects.find((p) => p.id === id);

export function exportBackup() {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = `tailors-workbench-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function importBackup(file) {
  const data = JSON.parse(await file.text());
  if (!Array.isArray(data.profiles) || !Array.isArray(data.projects)) throw new Error('This file is not a Tailor\'s Workbench backup.');
  Object.assign(store, data); save();
}
