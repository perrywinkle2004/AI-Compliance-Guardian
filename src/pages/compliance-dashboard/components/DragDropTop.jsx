// src/pages/compliance-dashboard/components/DragDropTop.jsx
import React, { useState, useCallback, useRef } from "react";
import Button from "../../../components/ui/Button";

/**
 * DragDropTop — improved:
 * - Clickable Choose file reliably triggers hidden input
 * - Accepts .txt, .doc, .docx, .csv, .pdf, .xlsx
 * - Drag & drop works across full area
 * - Shows progress + results
 * - Generates reports via backend /reports/generate (form POST)
 */

const API_BASE = (import.meta?.env?.VITE_API_URL || "http://localhost:8000").replace(/\/+$/, "");
const UPLOAD_URL = `${API_BASE}/chat/upload`;
const CSV_URL = `${API_BASE}/metrics/export/csv`;

const ALLOWED_EXT = [".txt", ".csv", ".doc", ".docx", ".pdf", ".xlsx"];
const MAX_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

const DragDropTop = ({ onProcessed }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const extOk = (name = "") => {
    const lower = name.toLowerCase();
    return ALLOWED_EXT.some(ext => lower.endsWith(ext));
  };

  const validateFile = (file) => {
    if (!file) return { ok: false, reason: "no_file" };
    if (!extOk(file.name)) return { ok: false, reason: "bad_ext" };
    if (file.size > MAX_SIZE_BYTES) return { ok: false, reason: "too_big" };
    return { ok: true };
  };

  const uploadFile = (file) => {
    return new Promise((resolve, reject) => {
      setError(null);
      setUploadPct(0);
      setProcessing(true);

      const xr = new XMLHttpRequest();
      const fd = new FormData();
      fd.append("file", file);
      fd.append("message", "Uploaded via dashboard top dropzone");

      xr.open("POST", UPLOAD_URL, true);

      xr.upload.onprogress = (ev) => {
        if (ev.lengthComputable) {
          setUploadPct(Math.round((ev.loaded / ev.total) * 100));
        }
      };

      xr.onload = () => {
        try {
          if (xr.status >= 200 && xr.status < 300) {
            const parsed = xr.responseText ? JSON.parse(xhrSafeParse(xr.responseText)) : {};
            resolve(parsed);
          } else {
            let msg = `Upload failed (${xr.status})`;
            try {
              const body = xr.responseText ? JSON.parse(xhrSafeParse(xr.responseText)) : null;
              if (body && body.detail) msg += ` — ${body.detail}`;
            } catch (e) {}
            reject(new Error(msg));
          }
        } catch (e) {
          reject(e);
        }
      };

      xr.onerror = () => reject(new Error("Network error during upload (backend unreachable)"));
      // small helper to avoid JSON.parse blowing up (we still try to parse)
      const xhrSafeParse = (text) => {
        try { return text; } catch (e) { return "{}"; }
      };

      xr.send(fd);
    });
  };

  // Slightly safer JSON.parse wrapper used only above; kept small

  const processFiles = async (files) => {
    if (!files || files.length === 0) return;
    setResult(null);
    setError(null);
    setUploadPct(0);

    const file = files[0];
    const v = validateFile(file);
    if (!v.ok) {
      if (v.reason === "bad_ext") {
        setError(`Unsupported file type. Use: ${ALLOWED_EXT.join(", ")}`);
      } else if (v.reason === "too_big") {
        setError("File too large. Max 100 MB.");
      } else {
        setError("Invalid file.");
      }
      return;
    }

    try {
      // Use fetch with FormData for better control (but keep xhr for progress)
      // We already wrote uploadFile using XHR for progress; call it.
      const res = await uploadFile(file);
      // attach filename so downstream can use it for report name
      const enriched = { ...res, filename: file.name };
      setResult(enriched);
      if (onProcessed) onProcessed(enriched);
    } catch (err) {
      console.error("upload error", err);
      if (err.message?.includes("404")) {
        setError("Upload endpoint not found (404). Check backend URL & server.");
      } else if (err.message?.includes("Network error")) {
        setError("Network error: cannot reach backend. Is FastAPI running?");
      } else {
        setError(err.message || "Upload failed");
      }
    } finally {
      setTimeout(() => {
        setProcessing(false);
        setUploadPct(0);
      }, 300);
    }
  };

  // drag handlers
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);
  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length) processFiles(files);
  }, []);

  // open chooser reliably
  const openFileChooser = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const onFileInput = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) processFiles(files);
    e.target.value = null;
  };

  // NEW: download report (pdf or docx) by posting current `result` to backend
  const downloadReport = async (fmt = "pdf") => {
    if (!result) {
      setError("No processing result available. Upload a file first.");
      return;
    }
    setError(null);
    setProcessing(true);
    try {
      // backend expects form fields: format, title, payload_json
      const form = new FormData();
      form.append("format", fmt);
      form.append("title", `Compliance report - ${result.filename || "scan"}`);

      // build structured payload the backend report builder expects
      const payload = {
        filename: result.filename || "uploaded_file",
        summary: result?.report?.summary || result?.reply || "",
        pii: result?.report?.pii || {},
        remediation: result?.report?.remediation || [],
        risks: result?.report?.risks || []
      };

      form.append("payload_json", JSON.stringify(payload));

      const resp = await fetch(`${API_BASE}/reports/generate`, {
        method: "POST",
        body: form
      });

      if (!resp.ok) {
        const txt = await resp.text().catch(() => "");
        throw new Error(txt || `Report generation failed (${resp.status})`);
      }

      const blob = await resp.blob();
      // attempt to read filename from content-disposition
      let fname = `compliance_report.${fmt === "pdf" ? "pdf" : "docx"}`;
      const cd = resp.headers.get("content-disposition");
      if (cd) {
        const m = /filename\*=UTF-8''(.+)|filename="?([^";]+)"?/.exec(cd);
        if (m) fname = decodeURIComponent(m[1] || m[2]);
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("report download error", err);
      setError(err.message || "Report generation failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mb-6">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 rounded-lg p-6 flex flex-col md:flex-row items-center justify-between transition-shadow ${dragActive ? "border-primary bg-surface shadow-md" : "border-border bg-white"}`}
        style={{ cursor: "pointer" }}
      >
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold">Drag & drop personal files to scan for PII</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detect emails, phone numbers, SSN-like patterns and get remediation suggestions.
            Supported: {ALLOWED_EXT.join(", ")}. Max 100 MB.
          </p>

          <div className="mt-3 flex items-center space-x-3">
            {/* explicit file input with accept filter */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_EXT.map(e => (e === ".xlsx" ? ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : e)).join(",")}
              onChange={onFileInput}
              className="hidden"
            />

            <div onClick={openFileChooser}>
              <Button variant="outline" iconName="Upload">Choose file</Button>
            </div>

            <Button variant="ghost" onClick={() => { if (!processing) { setResult(null); setError(null); } }}>
              Clear
            </Button>

            {/* NEW: Generate Report buttons (PDF and DOCX) */}
            <div className="ml-2 flex items-center space-x-2">
              <Button variant="default" iconName="Download" onClick={() => downloadReport("pdf")} disabled={!result || processing}>
                Generate Report (PDF)
              </Button>
              <Button variant="outline" iconName="Download" onClick={() => downloadReport("docx")} disabled={!result || processing}>
                Generate Report (DOCX)
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 mt-4 md:mt-0 md:pl-6">
          <div className="text-sm text-muted-foreground">Upload status</div>
          <div className="w-full bg-muted/20 rounded-full h-3 mt-2 overflow-hidden">
            <div style={{ width: `${uploadPct}%` }} className="h-3 transition-all rounded-full bg-primary" />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs">
            <div>{processing ? `Processing (${uploadPct}%)` : (result ? "Done" : "Idle")}</div>
            <div className="text-muted-foreground">{uploadPct ? `${uploadPct}%` : ""}</div>
          </div>
        </div>
      </div>

      {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded border border-border">
          <div className="flex items-start justify-between">
            <div className="pr-6">
              <h3 className="font-medium">Processing Results</h3>
              <p className="text-sm text-muted-foreground mt-1">{result?.report?.summary || result?.reply}</p>

              <div className="mt-3">
                <strong>PII detected:</strong>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  {result?.report?.pii ? (
                    Object.entries(result.report.pii).map(([k, v]) => (
                      <li key={k}>
                        <span className="capitalize">{k.replace('_', ' ')}:</span>
                        {" "}
                        {Array.isArray(v) ? (
                          <>
                            {v.length} instance{v.length !== 1 ? "s" : ""} —
                            <div className="mt-1 ml-4 text-xs text-muted-foreground">
                              {v.slice(0, 6).map((item, idx) => <div key={idx} className="truncate">{item}</div>)}
                              {v.length > 6 && <div className="text-xs">...and {v.length - 6} more</div>}
                            </div>
                          </>
                        ) : String(v)}
                      </li>
                    ))
                  ) : <li>No structured PII returned</li>}
                </ul>
              </div>

              {result?.report?.remediation && result.report.remediation.length > 0 && (
                <div className="mt-3">
                  <strong>Suggested remediation:</strong>
                  <ul className="list-disc ml-6 mt-2 text-sm">
                    {result.report.remediation.slice(0,5).map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </div>

            <div className="text-right">
              <a href={`${CSV_URL}?range_hours=24`} className="inline-block">
                <Button variant="default" iconName="Download">Download Metrics CSV</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropTop;
