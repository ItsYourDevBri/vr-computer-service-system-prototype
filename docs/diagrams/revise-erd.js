import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(here, 'proposed-system-diagrams.drawio');
const source = fs.readFileSync(path.join(here, 'proposed-system-diagrams-before-erd-revision-2026-11-08.drawio'), 'utf8');
const pages = [...source.matchAll(/<diagram\b[^>]*name="([^"]+)"[^>]*>([\s\S]*?)<\/diagram>/g)]
  .map(([, name, body]) => ({ name, body }));
if (pages.length !== 8) throw new Error(`Expected eight pages; found ${pages.length}`);

const esc = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const entityStyle = 'rounded=0;whiteSpace=wrap;html=1;fillColor=#ffffff;strokeColor=#000000;fontColor=#000000;align=left;verticalAlign=top;spacing=0;overflow=hidden;';
const textStyle = 'text;html=1;align=left;verticalAlign=middle;fontColor=#000000;fontSize=13;fontStyle=1;';
const edgeStyle = 'edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#000000;fontColor=#000000;fontSize=12;';

const entities = [
  ['ROLES', ['PK role_id : INT', 'role_name : VARCHAR', 'description : VARCHAR'], 50, 100, 250, 130],
  ['USERS', ['PK user_id : INT', 'FK role_id : INT', 'full_name : VARCHAR', 'email : VARCHAR', 'account_status : VARCHAR'], 350, 80, 290, 160],
  ['INVITATIONS', ['PK invitation_id : INT', 'FK inviter_user_id : INT', 'FK invitee_role_id : INT', 'FK accepted_user_id : INT NULL', 'invitee_email : VARCHAR', 'status : VARCHAR', 'expires_at : DATETIME'], 750, 75, 320, 205],
  ['CLASSES', ['PK class_id : INT', 'FK instructor_id : INT', 'class_name : VARCHAR', 'school_year : VARCHAR', 'status : VARCHAR'], 350, 300, 290, 160],
  ['CLASS MEMBERSHIP', ['PK enrollment_id : INT', 'FK class_id : INT', 'FK student_id : INT', 'enrolled_at : DATETIME', 'status : VARCHAR'], 750, 300, 320, 160],
  ['ACTIVITY_PROGRESS', ['PK progress_id : INT', 'FK student_id : INT', 'FK module_id : INT', 'status : VARCHAR', 'completion_pct : DECIMAL'], 1120, 300, 300, 160],
  ['LEARNING_MODULES', ['PK module_id : INT', 'module_name : VARCHAR', 'module_type : VARCHAR', 'viewing_mode : VARCHAR'], 50, 540, 270, 140],
  ['HARDWARE_COMPONENTS', ['PK component_id : INT', 'component_name : VARCHAR', 'description : TEXT'], 350, 540, 270, 120],
  ['MODULE_COMPONENTS', ['PK module_id : INT', 'PK component_id : INT', 'display_order : INT'], 680, 540, 280, 120],
  ['ASSESSMENTS', ['PK assessment_id : INT', 'assessment_name : VARCHAR', 'assessment_type : VARCHAR', 'procedure_scope : TEXT'], 50, 800, 270, 140],
  ['ASSESSMENT_ASSIGNMENTS', ['PK assignment_id : INT', 'FK assessment_id : INT', 'FK instructor_id : INT', 'FK class_id : INT NULL', 'FK student_id : INT NULL', 'assigned_at : DATETIME', 'due_at : DATETIME', 'status : VARCHAR'], 400, 780, 330, 190],
  ['ASSESSMENT_RESULTS', ['PK result_id : INT', 'FK assignment_id : INT', 'FK student_id : INT', 'score : DECIMAL', 'result_status : VARCHAR', 'submitted_at : DATETIME'], 850, 800, 300, 160],
];

function entityHtml(name, attrs) {
  const rows = attrs.map((attr) => {
    const marker = attr.startsWith('PK ') ? 'PK' : attr.startsWith('FK ') ? 'FK' : '';
    const label = attr.replace(/^(PK|FK)\s+/, '');
    return `<tr><td style="border-top:1px solid #000000;padding:2px 5px;text-align:center;width:34px;font-size:9px;">${marker}</td><td style="border-top:1px solid #000000;padding:2px 5px;text-align:left;white-space:normal;font-size:10px;">${label}</td></tr>`;
  }).join('');
  return `<table border="0" cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;table-layout:fixed;font-family:Arial,sans-serif;font-size:10px;"><tr><th colspan="2" style="background:#eaf2f8;border-bottom:1px solid #000000;padding:4px 5px;text-align:center;font-size:12px;">${name}</th></tr>${rows}<tr><td colspan="2" style="border-top:1px solid #000000;padding:2px 5px;text-align:left;font-size:9px;"><i>Methods: —</i></td></tr></table>`;
}

function buildErdPage() {
  let id = 10;
  const cell = (value, x, y, w, h, style, parent = '1') => {
    const current = String(id++);
    return `<mxCell id="${current}" value="${esc(value)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`;
  };
  const ids = {};
  let body = '<mxGraphModel grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1500" pageHeight="1050" background="#ffffff" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>';
  body += cell('<b>Proposed UML Class Diagram</b><br><font style="font-size:12px">VR-Based CSS Training Application — conceptual future logical model</font>', 30, 20, 900, 48, 'text;html=1;align=left;verticalAlign=middle;fontColor=#000000;fontSize=17;');
  body += cell('Cardinality: | = one   O| = zero/one   |&lt; = one/many   O&lt; = zero/many', 970, 25, 460, 28, 'text;html=1;align=right;verticalAlign=middle;fontColor=#000000;fontSize=10;');
  for (const [name, attrs, x, y, w, h] of entities) {
    ids[name] = id;
    body += cell(entityHtml(name, attrs), x, y, w, h, entityStyle);
  }
  const edge = (from, to, startMarker, endMarker, points = []) => {
    const current = String(id++);
    const pointXml = points.length ? `<Array as="points">${points.map(([x, y]) => `<mxPoint x="${x}" y="${y}"/>`).join('')}</Array>` : '';
    body += `<mxCell id="${current}" value="" style="${edgeStyle}startArrow=${startMarker};endArrow=${endMarker};" edge="1" parent="1" source="${ids[from]}" target="${ids[to]}"><mxGeometry relative="1" as="geometry">${pointXml}</mxGeometry></mxCell>`;
  };
  edge('ROLES', 'USERS', 'ERone', 'ERzeroToMany');
  edge('USERS', 'INVITATIONS', 'ERone', 'ERzeroToMany');
  edge('ROLES', 'INVITATIONS', 'ERone', 'ERzeroToMany', [[250, 260], [700, 260]]);
  edge('INVITATIONS', 'USERS', 'ERzeroToOne', 'ERzeroToOne', [[730, 285], [320, 285]]);
  edge('USERS', 'CLASSES', 'ERone', 'ERzeroToMany');
  edge('CLASSES', 'CLASS MEMBERSHIP', 'ERone', 'ERzeroToMany');
  edge('USERS', 'CLASS MEMBERSHIP', 'ERone', 'ERzeroToMany', [[680, 240], [720, 240], [720, 380]]);
  edge('LEARNING_MODULES', 'MODULE_COMPONENTS', 'ERone', 'ERzeroToMany', [[185, 700], [640, 700], [640, 600]]);
  edge('HARDWARE_COMPONENTS', 'MODULE_COMPONENTS', 'ERone', 'ERzeroToMany');
  edge('USERS', 'ACTIVITY_PROGRESS', 'ERone', 'ERzeroToMany', [[680, 220], [1080, 220], [1080, 380]]);
  edge('LEARNING_MODULES', 'ACTIVITY_PROGRESS', 'ERone', 'ERzeroToMany', [[185, 710], [1080, 710], [1080, 380]]);
  edge('ASSESSMENTS', 'ASSESSMENT_ASSIGNMENTS', 'ERone', 'ERzeroToMany');
  edge('USERS', 'ASSESSMENT_ASSIGNMENTS', 'ERone', 'ERzeroToMany', [[680, 240], [1060, 240], [1060, 770]]);
  edge('CLASSES', 'ASSESSMENT_ASSIGNMENTS', 'ERzeroToMany', 'ERzeroToOne', [[320, 500], [320, 750], [400, 750]]);
  edge('USERS', 'ASSESSMENT_ASSIGNMENTS', 'ERzeroToMany', 'ERzeroToOne', [[680, 250], [1090, 250], [1090, 770]]);
  edge('ASSESSMENT_ASSIGNMENTS', 'ASSESSMENT_RESULTS', 'ERone', 'ERzeroToMany');
  edge('USERS', 'ASSESSMENT_RESULTS', 'ERone', 'ERzeroToMany', [[680, 230], [1100, 230], [1100, 780]]);
  body += '</root></mxGraphModel>';
  return `<diagram id="entity-relationship-diagram" name="Entity Relationship Diagram">${body}</diagram>`;
}

const outputPages = pages.map((page) => page.name === 'Entity Relationship Diagram' ? buildErdPage() : `<diagram id="${esc(page.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'))}" name="${esc(page.name)}">${page.body}</diagram>`).join('');
fs.writeFileSync(file, `<mxfile host="app.diagrams.net" modified="2026-11-08T00:00:00.000Z" agent="Codex" version="32.6.10">${outputPages}</mxfile>`);
