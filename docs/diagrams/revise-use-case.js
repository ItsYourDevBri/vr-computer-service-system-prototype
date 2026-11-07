import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, 'proposed-system-diagrams.drawio');
const source = fs.readFileSync(path.join(here, 'proposed-system-diagrams-before-use-case-revision-2026-11-08.drawio'), 'utf8');
const existing = [...source.matchAll(/<diagram\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/diagram>/g)]
  .map(([, name, body]) => ({ name, body }));
if (existing.length !== 6) throw new Error(`Expected six existing pages; found ${existing.length}`);

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const pageHeader = (title, height) => `<mxGraphModel grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1200" pageHeight="${height}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>`;
const pageFooter = '</root></mxGraphModel>';
const titleStyle = 'text;html=1;align=left;verticalAlign=middle;fontColor=#000000;fontSize=18;fontStyle=1;';
const boundaryStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=16;fontStyle=1;verticalAlign=top;spacingTop=14;';
const actorStyle = 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=15;';
const ovalStyle = 'ellipse;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=14;spacing=8;';
const noteStyle = 'shape=note;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;fontSize=12;spacing=8;';
const edgeStyle = 'edgeStyle=none;html=1;strokeColor=#000000;endArrow=none;';

function page(title, actor, cases) {
  let id = 10;
  const cell = (value, x, y, w, h, style, parent = '1') => {
    const current = String(id++);
    return `<mxCell id="${current}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`;
  };
  const edge = (source, target) => {
    const current = String(id++);
    return `<mxCell id="${current}" value="" style="${edgeStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
  };
  const height = cases.length > 12 ? 1750 : 1350;
  let body = pageHeader(title, height);
  body += cell(`<b>${title}</b><br><font style="font-size:12px">VR-Based CSS Training Application</font>`, 30, 20, 1000, 48, titleStyle);
  body += cell('VR-Based CSS Training Application', 260, 90, 700, height - 210, boundaryStyle);
  const actorId = id;
  body += cell(actor, 80, Math.round(height / 2) - 55, 120, 110, actorStyle);
  const startY = cases.length > 12 ? 210 : 150;
  cases.forEach((name, index) => {
    const caseId = id;
    body += cell(name, 370, startY + index * 98, 360, 64, ovalStyle);
    body += edge(actorId, caseId);
  });
  body += cell('Actor associations show the role’s proposed direct interactions. Authentication, invitations, persistence, assessment recording, and progress reporting remain proposed/future services; current prototype UI is simulated.', 280, height - 90, 660, 52, noteStyle);
  return { name: title, body: pageFooter + body.slice(0, 0) };
}

function buildPage(title, actor, cases) {
  let id = 10;
  const cell = (value, x, y, w, h, style, parent = '1') => {
    const current = String(id++);
    return `<mxCell id="${current}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`;
  };
  const edge = (source, target) => {
    const current = String(id++);
    return `<mxCell id="${current}" value="" style="${edgeStyle}" edge="1" parent="1" source="${source}" target="${target}"><mxGeometry relative="1" as="geometry"/></mxCell>`;
  };
  const height = cases.length > 12 ? 1750 : 1350;
  let body = pageHeader(title, height);
  body += cell(`<b>${title}</b><br><font style="font-size:12px">VR-Based CSS Training Application</font>`, 30, 20, 1000, 48, titleStyle);
  body += cell('VR-Based CSS Training Application', 260, 90, 700, height - 210, boundaryStyle);
  const actorId = id;
  body += cell(actor, 80, Math.round(height / 2) - 55, 120, 110, actorStyle);
  const startY = cases.length > 12 ? 210 : 150;
  cases.forEach((name, index) => {
    const caseId = id;
    body += cell(name, 370, startY + index * 98, 360, 64, ovalStyle);
    body += edge(actorId, caseId);
  });
  body += cell('Actor associations show the role’s proposed direct interactions. Authentication, invitations, persistence, assessment recording, and progress reporting remain proposed/future services; current prototype UI is simulated.', 280, height - 90, 660, 52, noteStyle);
  body += pageFooter;
  return `<diagram id="use-case-${title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}" name="${esc(title)}">${body}</diagram>`;
}

const student = [
  'Activate Invitation / Access Account', 'Log In', 'Manage Profile',
  'Choose Learning Mode', 'Explore Hardware Components', 'Perform Guided Assembly',
  'Perform Guided Disassembly', 'Practice Learning Activities', 'Use Normal 3D View',
  'Use VR View', 'Take Assigned Assessment', 'View Activity Progress',
  'View Assessment Result', 'Log Out',
];
const instructor = [
  'Log In', 'Manage Profile', 'Manage Classes', 'Invite / Enroll Students',
  'Assign Assessment', 'Monitor Student Progress', 'Review Assessment Results',
  'View Student Activity Records', 'Log Out',
];
const principal = [
  'Log In', 'Manage Profile', 'Manage CSS Instructors',
  'View Class / Instructor Overview', 'Monitor Overall Progress',
  'Review Participation Overview', 'Manage Access / Invitations', 'Log Out',
];

const pages = [
  buildPage('Proposed Use Case Diagram of CSS Student', 'CSS Student', student),
  buildPage('Proposed Use Case Diagram of CSS Instructor', 'CSS Instructor', instructor),
  buildPage('Proposed Use Case Diagram of Principal', 'Principal', principal),
  ...existing.slice(1).map(({ name, body }) => `<diagram id="${esc(name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'))}" name="${esc(name)}">${body}</diagram>`),
].join('');

fs.writeFileSync(file, `<mxfile host="app.diagrams.net" modified="2026-11-08T00:00:00.000Z" agent="Codex" version="32.6.10">${pages}</mxfile>`);
