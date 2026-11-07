import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const pages = [
  ['proposed-use-case.drawio', 'Use Case Diagram'],
  ['proposed-block-diagram.drawio', 'Block Diagram'],
  ['proposed-dfd-level-0.drawio', 'DFD Level 0'],
  ['proposed-dfd-level-1.drawio', 'DFD Level 1'],
  ['proposed-erd.drawio', 'Entity Relationship Diagram'],
  ['proposed-system-flowchart.drawio', 'System Flowchart'],
];

const diagrams = pages.map(([file, name], index) => {
  const source = fs.readFileSync(path.join(here, file), 'utf8');
  const match = source.match(/<diagram\b[^>]*>([\s\S]*?)<\/diagram>/);
  if (!match) throw new Error(`No diagram element found in ${file}`);
  const inner = match[1];
  const model = inner.match(/<mxGraphModel\b[\s\S]*<\/mxGraphModel>/)?.[0];
  if (!model) throw new Error(`No mxGraphModel found in ${file}`);
  return `<diagram id="page-${index + 1}" name="${name}">${model}</diagram>`;
}).join('');

const output = `<mxfile host="app.diagrams.net" modified="2026-11-08T00:00:00.000Z" agent="Codex" version="32.6.10">${diagrams}</mxfile>`;
fs.writeFileSync(path.join(here, 'proposed-system-diagrams.drawio'), output);
