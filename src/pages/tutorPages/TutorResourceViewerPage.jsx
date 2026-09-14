import { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ArrowLeft, Calculator, Circle, Eraser, Highlighter, Maximize2, Minimize2, Minus, MousePointer2, Pen, Redo2, Save, Square, Trash2, Type, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { safeCalculate } from "../../lib/safeCalculate";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
const VIEW_W = 1000;
const VIEW_H = 1414;
const tools = [{ id: "select", icon: MousePointer2 }, { id: "pen", icon: Pen }, { id: "highlight", icon: Highlighter }, { id: "text", icon: Type }, { id: "line", icon: Minus }, { id: "arrow", icon: ArrowLeft }, { id: "rect", icon: Square }, { id: "ellipse", icon: Circle }, { id: "eraser", icon: Eraser }];

export default function TutorResourceViewerPage() {
  const { id } = useParams(); const navigate = useNavigate(); const { user, role } = useAuth();
  const isStudent = role === "student";
  const libraryPath = isStudent ? "/student-resources" : "/tutor-resources";
  const [resource, setResource] = useState(null); const [url, setUrl] = useState("");
  const [pages, setPages] = useState(0); const [page, setPage] = useState(1); const [zoom, setZoom] = useState(1);
  const [tool, setTool] = useState("select"); const [color, setColor] = useState("#f97316"); const [size, setSize] = useState(4);
  const [annotations, setAnnotations] = useState([]); const [history, setHistory] = useState([]); const [future, setFuture] = useState([]);
  const [drawing, setDrawing] = useState(null); const [selected, setSelected] = useState(null); const [loaded, setLoaded] = useState(false);
  const [moving, setMoving] = useState(null); const [pendingText, setPendingText] = useState("");
  const [textDraft, setTextDraft] = useState(null);
  const [eraserSize, setEraserSize] = useState(40);
  const [eraserPointer, setEraserPointer] = useState(null);
  const drawingRef = useRef(null);
  const eraseSession = useRef(null);
  const [calculator, setCalculator] = useState(false); const [expression, setExpression] = useState(""); const [result, setResult] = useState("");
  const [pageWidth, setPageWidth] = useState(760); const pageHost = useRef(null);
  const viewerRoot = useRef(null); const [isFullscreen, setIsFullscreen] = useState(false);

  const log = useCallback((action) => supabase.from("tutor_resource_access_logs").insert({ resource_id: id, user_id: user.id, action }), [id, user]);
  const renewUrl = useCallback(async (path) => {
    const { data, error } = await supabase.storage.from("tutor-resources").createSignedUrl(path, 300);
    if (error) throw error; setUrl(data.signedUrl);
  }, []);

  useEffect(() => {
    let active = true;
    async function start() {
      const { data, error } = await supabase.from("tutor_resources").select("*").eq("id", id).single();
      if (!active) return;
      if (error) { toast.error("Resource is unavailable or unauthorized"); navigate(libraryPath); return; }
      setResource(data);
      try { await renewUrl(data.storage_path); await log("view"); } catch { toast.error("Secure document access failed"); }
    }
    start(); return () => { active = false; };
  }, [id, libraryPath, log, navigate, renewUrl]);

  useEffect(() => {
    const node = pageHost.current; if (!node) return;
    const observer = new ResizeObserver(([entry]) => setPageWidth(Math.min(900, entry.contentRect.width - 24)));
    observer.observe(node); return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isStudent) return;
    let active = true;
    supabase.from("tutor_resource_annotations").select("annotation_data").eq("resource_id", id).eq("user_id", user.id).eq("page_number", page).maybeSingle().then(({ data, error }) => {
      if (!active) return; if (error) toast.error("Annotations could not be loaded");
      setAnnotations(data?.annotation_data || []); setHistory([]); setFuture([]); setLoaded(true);
    });
    return () => { active = false; };
  }, [id, isStudent, page, user.id]);

  useEffect(() => {
    if (isStudent || !loaded) return;
    const timeout = setTimeout(async () => {
      const { error } = await supabase.from("tutor_resource_annotations").upsert({ resource_id: id, user_id: user.id, page_number: page, annotation_data: annotations }, { onConflict: "resource_id,user_id,page_number" });
      if (error) toast.error("Annotations could not be saved"); else await log(annotations.length ? "annotation_saved" : "annotation_deleted");
    }, 900);
    return () => clearTimeout(timeout);
  }, [annotations, id, isStudent, loaded, log, page, user.id]);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(document.fullscreenElement === viewerRoot.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const block = (event) => { if ((event.ctrlKey || event.metaKey) && ["p", "s"].includes(event.key.toLowerCase())) { event.preventDefault(); toast("Printing and downloading are disabled"); } };
    window.addEventListener("keydown", block); return () => window.removeEventListener("keydown", block);
  }, []);

  const point = (event) => { const rect = event.currentTarget.getBoundingClientRect(); return { x: ((event.clientX - rect.left) / rect.width) * VIEW_W, y: ((event.clientY - rect.top) / rect.height) * VIEW_H }; };
  const commit = (next) => { setHistory((items) => [...items.slice(-39), annotations]); setFuture([]); setAnnotations(next); };
  const startDrawing = (item) => { drawingRef.current = item; setDrawing(item); };
  const eraseAt = (position) => {
    setAnnotations((current) => {
      const next = current.filter((item) => !annotationIntersects(item, position, eraserSize / 2));
      if (next.length !== current.length && eraseSession.current) eraseSession.current.changed = true;
      return next;
    });
  };
  function pointerDown(event) {
    const p = point(event); event.currentTarget.setPointerCapture(event.pointerId);
    if (tool === "eraser") { eraseSession.current = { before: annotations, changed: false }; setEraserPointer(p); eraseAt(p); return; }
    if (tool === "text") { setTextDraft({ x: p.x, y: p.y, value: pendingText }); setPendingText(""); return; }
    if (["pen", "highlight"].includes(tool)) startDrawing({ id: crypto.randomUUID(), type: tool, points: [p], color, size });
    if (["line", "arrow", "rect", "ellipse"].includes(tool)) startDrawing({ id: crypto.randomUUID(), type: tool, x: p.x, y: p.y, x2: p.x, y2: p.y, color, size });
  }
  function pointerMove(event) {
    const p = point(event);
    if (tool === "eraser") { setEraserPointer(p); if (eraseSession.current) eraseAt(p); return; }
    if (moving) {
      const dx = p.x - moving.start.x; const dy = p.y - moving.start.y;
      setAnnotations((items) => items.map((item) => item.id === moving.id ? translateAnnotation(moving.original, dx, dy) : item));
      return;
    }
    if (!drawing) return;
    setDrawing((item) => {
      const next = item.points ? { ...item, points: [...item.points, p] } : { ...item, x2: p.x, y2: p.y };
      drawingRef.current = next;
      return next;
    });
  }
  function pointerUp() {
    const completedErase = eraseSession.current;
    eraseSession.current = null;
    if (completedErase?.changed) {
      setHistory((items) => [...items.slice(-39), completedErase.before]);
      setFuture([]);
    }
    const completedMove = moving;
    if (completedMove) {
      setHistory((items) => [...items.slice(-39), completedMove.before]);
      setFuture([]);
      setMoving(null);
    }
    if (drawingRef.current) commit([...annotations, drawingRef.current]);
    drawingRef.current = null; setDrawing(null);
  }
  function annotationClick(event, item) {
    event.stopPropagation();
    if (tool === "select") {
      const svg = event.currentTarget.ownerSVGElement || event.currentTarget;
      const rect = svg.getBoundingClientRect();
      const start = { x: ((event.clientX - rect.left) / rect.width) * VIEW_W, y: ((event.clientY - rect.top) / rect.height) * VIEW_H };
      svg.setPointerCapture?.(event.pointerId); setSelected(item.id); setMoving({ id: item.id, start, original: item, before: annotations });
    }
  }
  const undo = () => { if (!history.length) return; setFuture((items) => [annotations, ...items]); setAnnotations(history.at(-1)); setHistory((items) => items.slice(0, -1)); };
  const redo = () => { if (!future.length) return; setHistory((items) => [...items, annotations]); setAnnotations(future[0]); setFuture((items) => items.slice(1)); };
  const changePage = (nextPage) => { setLoaded(false); setPage(nextPage); };
  const drawItem = (item) => {
    const common = { stroke: item.color, strokeWidth: item.size, fill: "none", onPointerDown: (e) => annotationClick(e, item), className: selected === item.id ? "drop-shadow-[0_0_4px_#2563eb]" : "" };
    if (item.points) return <polyline key={item.id} {...common} points={item.points.map((p) => `${p.x},${p.y}`).join(" ")} opacity={item.type === "highlight" ? .35 : 1} strokeWidth={item.type === "highlight" ? item.size * 5 : item.size} strokeLinecap="round" strokeLinejoin="round" />;
    if (item.type === "text") return <text key={item.id} x={item.x} y={item.y} fill={item.color} fontSize={item.size} onPointerDown={(e) => annotationClick(e, item)}>{item.text}</text>;
    if (item.type === "rect") return <rect key={item.id} {...common} x={Math.min(item.x, item.x2)} y={Math.min(item.y, item.y2)} width={Math.abs(item.x2-item.x)} height={Math.abs(item.y2-item.y)} />;
    if (item.type === "ellipse") return <ellipse key={item.id} {...common} cx={(item.x+item.x2)/2} cy={(item.y+item.y2)/2} rx={Math.abs(item.x2-item.x)/2} ry={Math.abs(item.y2-item.y)/2} />;
    return <g key={item.id} onPointerDown={(e) => annotationClick(e, item)}><line {...common} x1={item.x} y1={item.y} x2={item.x2} y2={item.y2} />{item.type === "arrow" && <polygon fill={item.color} points={`${item.x2},${item.y2} ${item.x2-14},${item.y2-8} ${item.x2-14},${item.y2+8}`} />}</g>;
  };
  function calculate() { try { setResult(String(safeCalculate(expression))); } catch (error) { setResult(error.message); } }
  function finishText() {
    if (!textDraft) return;
    const value = textDraft.value.trim();
    if (value) commit([...annotations, { id: crypto.randomUUID(), type: "text", x: textDraft.x, y: textDraft.y, text: value, color, size: size * 4 + 10 }]);
    setTextDraft(null);
  }
  async function clearAll() {
    if (!window.confirm("Clear all of your annotations for this resource?")) return;
    const { error } = await supabase.from("tutor_resource_annotations").delete().eq("resource_id", id).eq("user_id", user.id);
    if (error) return toast.error("Annotations could not be cleared");
    setAnnotations([]); setHistory([]); setFuture([]); await log("annotation_deleted"); toast.success("All annotations cleared");
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await viewerRoot.current?.requestFullscreen();
    } catch {
      toast.error("Fullscreen mode is not available in this browser");
    }
  }

  if (!resource || !url) return <div className="h-full flex items-center justify-center text-slate-500">Opening secure resource...</div>;
  return <div ref={viewerRoot} className="relative flex h-full flex-col bg-slate-900" onContextMenu={(e) => e.preventDefault()}>
    <header className="flex items-center gap-3 bg-white px-3 py-2 border-b"><button onClick={() => navigate(libraryPath)} className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft size={18} /></button><div className="min-w-0 flex-1"><h1 className="truncate text-sm font-semibold">{resource.title}</h1><p className="text-xs text-slate-400">{user.email}</p></div><span className="hidden sm:block text-xs text-slate-400">{isStudent ? "Secure reader" : "Private teaching workspace"}</span><button type="button" onClick={toggleFullscreen} title={isFullscreen ? "Exit fullscreen" : "Open fullscreen"} className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-orange-50 hover:text-orange-600">{isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button></header>
    {!isStudent && <div className="flex flex-wrap items-center gap-1 border-b bg-white px-3 py-2">{tools.map((item) => { const Icon = item.icon; return <button key={item.id} title={item.id} onClick={() => setTool(item.id)} className={`p-2 rounded-lg ${tool === item.id ? "bg-orange-100 text-orange-600" : "hover:bg-slate-100"}`}><Icon size={17} /></button>; })}{tool === "eraser" ? <div className="ml-2 flex items-center gap-1 rounded-xl bg-slate-100 p-1" aria-label="Eraser size">{[20, 40, 70, 100].map((value) => <button key={value} type="button" onClick={() => setEraserSize(value)} title={`${value}px eraser`} className={`flex h-8 w-9 items-center justify-center rounded-lg transition ${eraserSize === value ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:bg-white/70"}`}><span className="rounded-full border-2 border-current" style={{ width: Math.max(7, value / 5), height: Math.max(7, value / 5) }} /></button>)}</div> : <><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="ml-1 h-8 w-8" /><input type="range" min="2" max="12" value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-20" /></>}<span className="mx-1 h-6 border-l" /><button title="Undo" onClick={undo} disabled={!history.length} className="p-2 disabled:opacity-30"><Undo2 size={17} /></button><button title="Redo" onClick={redo} disabled={!future.length} className="p-2 disabled:opacity-30"><Redo2 size={17} /></button><button title="Delete selected" onClick={() => selected && commit(annotations.filter((item) => item.id !== selected))} className="p-2"><Trash2 size={17} /></button><button title="Clear this page" onClick={() => { if (window.confirm("Clear annotations on this page?")) commit([]); }} className="p-2 text-red-500"><Eraser size={17} /></button><button title="Clear all pages" onClick={clearAll} className="px-2 text-xs text-red-500">Clear all</button><span className="mx-1 h-6 border-l" /><button onClick={() => setZoom((v) => Math.max(.6, v-.1))} className="p-2"><ZoomOut size={17} /></button><span className="text-xs w-10 text-center">{Math.round(zoom*100)}%</span><button onClick={() => setZoom((v) => Math.min(2, v+.1))} className="p-2"><ZoomIn size={17} /></button><button onClick={() => setCalculator((v) => !v)} className="ml-auto p-2 rounded-lg hover:bg-orange-50"><Calculator size={18} /></button></div>}
    <div ref={pageHost} className="relative flex-1 overflow-auto p-3 sm:p-6"><div className="relative mx-auto bg-white shadow-2xl" style={{ width: pageWidth * zoom }}><Document file={url} onLoadSuccess={({ numPages }) => setPages(numPages)} onLoadError={() => renewUrl(resource.storage_path)} loading={<p className="p-10">Rendering PDF...</p>}><Page pageNumber={page} width={pageWidth * zoom} /></Document>{!isStudent && <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onPointerLeave={() => !eraseSession.current && setEraserPointer(null)} className={`absolute inset-0 h-full w-full touch-none ${tool === "select" ? "cursor-default" : tool === "eraser" ? "cursor-none" : "cursor-crosshair"}`}><g style={{ pointerEvents: tool === "eraser" ? "none" : "auto" }}>{annotations.map(drawItem)}{drawing && drawItem(drawing)}</g>{tool === "eraser" && eraserPointer && <circle cx={eraserPointer.x} cy={eraserPointer.y} r={eraserSize / 2} fill="rgba(255,255,255,0.72)" stroke="#f97316" strokeWidth="2" pointerEvents="none" />}</svg>}{!isStudent && textDraft && <input autoFocus value={textDraft.value} onChange={(event) => setTextDraft({ ...textDraft, value: event.target.value })} onBlur={finishText} onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); if (event.key === "Escape") setTextDraft(null); }} onPointerDown={(event) => event.stopPropagation()} placeholder="Type here…" className="absolute z-10 min-w-40 rounded-lg border border-orange-300 bg-white/95 px-2 py-1 text-sm shadow-lg outline-none ring-4 ring-orange-100" style={{ left: `${(textDraft.x / VIEW_W) * 100}%`, top: `${(textDraft.y / VIEW_H) * 100}%`, color, fontSize: `${Math.max(14, size * 2 + 10)}px` }} />}<div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.035] text-2xl font-bold text-slate-900 rotate-[-25deg]">{user.email}</div></div></div>
    <footer className="flex items-center justify-center gap-4 bg-white px-3 py-2"><button disabled={page <= 1} onClick={() => changePage(page - 1)} className="px-3 py-1 text-sm disabled:opacity-30">Previous</button><span className="text-sm">Page {page} of {pages || "…"}</span><button disabled={page >= pages} onClick={() => changePage(page + 1)} className="px-3 py-1 text-sm disabled:opacity-30">Next</button>{!isStudent && <><Save size={14} className="ml-3 text-emerald-500" /><span className="text-xs text-slate-400">Autosaved</span></>}</footer>
    {!isStudent && calculator && <div className="absolute bottom-14 right-4 z-20 w-72 rounded-2xl border bg-white p-4 shadow-2xl"><div className="flex justify-between"><h2 className="font-semibold">Calculator</h2><button onClick={() => setCalculator(false)}><XIcon /></button></div><input value={expression} onChange={(e) => setExpression(e.target.value)} onKeyDown={(e) => e.key === "Enter" && calculate()} placeholder="(25 + 5) × 2" className="mt-3 w-full rounded-xl border p-3" /><p className="mt-2 min-h-7 text-right font-mono text-lg">{result}</p><div className="mt-2 flex gap-2"><button onClick={calculate} className="flex-1 rounded-xl bg-orange-500 py-2 text-white">Calculate</button>{result && !Number.isNaN(Number(result)) && <button onClick={() => { setTool("text"); setPendingText(result); setCalculator(false); toast("Click the PDF to place the result"); }} className="rounded-xl border px-3">Use result</button>}</div></div>}
  </div>;
}

function XIcon() { return <span className="text-lg leading-none">×</span>; }

function translateAnnotation(item, dx, dy) {
  if (item.points) return { ...item, points: item.points.map((point) => ({ x: point.x + dx, y: point.y + dy })) };
  if (item.type === "text") return { ...item, x: item.x + dx, y: item.y + dy };
  return { ...item, x: item.x + dx, y: item.y + dy, x2: item.x2 + dx, y2: item.y2 + dy };
}

function annotationIntersects(item, point, radius) {
  if (item.points?.length) {
    return item.points.some((current, index) => {
      if (index === 0) return distance(current, point) <= radius;
      return distanceToSegment(point, item.points[index - 1], current) <= radius;
    });
  }

  if (item.type === "text") {
    const width = Math.max(item.size, item.text.length * item.size * 0.58);
    return point.x >= item.x - radius && point.x <= item.x + width + radius &&
      point.y >= item.y - item.size - radius && point.y <= item.y + radius;
  }

  if (item.type === "rect") {
    const left = Math.min(item.x, item.x2) - radius;
    const right = Math.max(item.x, item.x2) + radius;
    const top = Math.min(item.y, item.y2) - radius;
    const bottom = Math.max(item.y, item.y2) + radius;
    return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
  }

  if (item.type === "ellipse") {
    const rx = Math.max(1, Math.abs(item.x2 - item.x) / 2 + radius);
    const ry = Math.max(1, Math.abs(item.y2 - item.y) / 2 + radius);
    const cx = (item.x + item.x2) / 2;
    const cy = (item.y + item.y2) / 2;
    return ((point.x - cx) ** 2) / (rx ** 2) + ((point.y - cy) ** 2) / (ry ** 2) <= 1;
  }

  return distanceToSegment(
    point,
    { x: item.x, y: item.y },
    { x: item.x2, y: item.y2 },
  ) <= radius;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (dx === 0 && dy === 0) return distance(point, start);
  const amount = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / (dx * dx + dy * dy)),
  );
  return distance(point, { x: start.x + amount * dx, y: start.y + amount * dy });
}
