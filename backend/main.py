import os
import uuid
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from pydantic import BaseModel

import aiofiles
import re
from typing import Optional, Dict, Any, List

from utils import extract_text_from_file
from ai_service import analyze_document_with_ai

from rbac import admin_only
from auth import router as auth_router
from activity_store import _record_activity, ACTIVITY

from contextlib import asynccontextmanager

# Mongo imports kept only so existing code does not break
from database import (
    get_database,
    ANALYSIS_COLLECTION,
    ComplianceAnalysisResult
)

load_dotenv()


from database import connect_to_mongo, close_mongo_connection
from auth import seed_default_users

# --------------------------------
# Lifespan (Safe MongoDB Connection)
# --------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Vigil AI backend starting...")
    mongo_connected = False
    try:
        await connect_to_mongo()
        # Only seed if connection didn't immediately fail
        await seed_default_users()
        mongo_connected = True
        print("Vigil AI backend started with MongoDB connection")
    except Exception as e:
        print(f"Vigil AI backend started (MongoDB disabled/failed: {e})")
    
    yield
    
    if mongo_connected:
        try:
            await close_mongo_connection()
        except:
            pass
    print("Vigil AI backend stopped")


app = FastAPI(title="Vigil AI Compliance Guardian", lifespan=lifespan)

app.include_router(auth_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

METRICS_TREND: List[Dict[str, Any]] = []
DISTRIBUTION_COUNTER: Dict[str, int] = {}
CATEGORY_COUNTER: Dict[str, int] = {}


# --------------------------------
# Synthetic Metrics Initialization
# --------------------------------

def init_synthetic_metrics():
    now = datetime.now(timezone.utc)

    for i in range(7, 0, -1):
        t = now - timedelta(days=i)

        compliance = round(78 + (i % 5) * 1.8, 1)
        risk_items = max(2, int(120 - compliance))
        remediated = int(risk_items * 0.5)

        METRICS_TREND.append({
            "timestamp": t.isoformat() + "Z",
            "complianceScore": compliance,
            "riskItems": risk_items,
            "remediatedItems": remediated
        })

    global DISTRIBUTION_COUNTER, CATEGORY_COUNTER

    DISTRIBUTION_COUNTER = {
        "Slack": 35,
        "Email": 28,
        "GitHub": 18,
        "Jira": 12,
        "Database": 7
    }

    CATEGORY_COUNTER = {
        "SSN": 45,
        "Credit Card": 32,
        "Email": 89,
        "Phone": 67
    }


init_synthetic_metrics()


# --------------------------------
# Chat Models
# --------------------------------

class ChatRequest(BaseModel):
    message: Optional[str] = ""


# --------------------------------
# Simple PII Detection
# --------------------------------

def remediation_engine(findings: Dict[str, Any]):
    fixes = []
    if findings.get("emails"):
        fixes.append("Mask email addresses or apply email redaction.")
    if findings.get("phones"):
        fixes.append("Encrypt phone numbers and restrict access.")
    if findings.get("ssn"):
        fixes.append("Move SSNs to a secure vault.")
    if findings.get("api_keys"):
        fixes.append("Remove hardcoded API keys and store them in environment variables.")
    if findings.get("passwords"):
        fixes.append("Rotate compromised passwords immediately and use a secret manager.")
    if findings.get("jira_tickets"):
        fixes.append("Review Jira ticket permissions and sanitize internal logs.")
    if findings.get("contracts"):
        fixes.append("Apply strict RBAC to contract documents and mask financial numbers.")
    return fixes

def detect_dataset_type(filename: str, text: str):
    name = filename.lower()
    if "jira" in name:
        return "jira"
    if "slack" in name:
        return "slack"
    if name.endswith((".py", ".js", ".java", ".go", ".cpp", ".ts")):
        return "code"
    if "contract" in name:
        return "contract"
    if "email" in name or "@company.com" in text:
        return "email"
    return "document"

def pii_detector_agent(text: str, dataset_type: str = "document"):
    findings = {
        "emails": list(set(re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text))),
        "phones": list(set(re.findall(r"\b(?:\+?\d{1,3}[-.\s]?)?\d{10}\b", text))),
        "linkedin": list(set(re.findall(r"linkedin\.com\/in\/[a-zA-Z0-9\-]+", text))),
        "github": list(set(re.findall(r"github\.com\/[a-zA-Z0-9\-]+", text))),
        "names": list(set(re.findall(r"\b[A-Z][a-z]+\s[A-Z][a-z]+\b", text[:1000]))),
        "locations": list(set(re.findall(r"\b[A-Z][a-z]+,\s[A-Z][a-z]+\b", text))),
        "urls": list(set(re.findall(r"https?:\/\/[^\s]+", text))),
        "ssn": list(set(re.findall(r"\d{3}-\d{2}-\d{4}", text))),
        "api_keys": [],
        "passwords": [],
        "jira_tickets": []
    }

    # Specialized detectors
    if dataset_type == "code":
        findings["api_keys"] = list(set(re.findall(r'API_KEY\s*=\s*["\'][A-Za-z0-9-_]{20,}["\']', text)))
        findings["passwords"] = list(set(re.findall(r'password\s*=\s*["\'][^"\']+["\']', text)))
    
    if dataset_type == "jira":
        findings["jira_tickets"] = list(set(re.findall(r"\b[A-Z]{2,}-\d+\b", text)))

    detailed_findings = []
    severity_map = {
        "ssn": "Critical",
        "api_keys": "Critical",
        "passwords": "Critical",
        "phones": "Medium",
        "emails": "Medium",
        "names": "Low",
        "locations": "Low",
        "linkedin": "Low",
        "github": "Low",
        "urls": "Low",
        "jira_tickets": "High"
    }

    for key, values in findings.items():
        for val in values:
            detailed_findings.append({
                "type": key.replace("_", " ").upper(),
                "value": val,
                "severity": severity_map.get(key, "Low")
            })

    counts = {k: len(v) for k, v in findings.items()}
    
    return {
        **findings,
        "detailed_findings": detailed_findings,
        "counts": counts
    }


def summarizer_agent(text: str):
    return text[:200]


# --------------------------------
# Chat Endpoint
# --------------------------------

@app.post("/chat")
async def chat(req: ChatRequest):

    message = req.message.lower()

    if "pii" in message or "scan" in message:

        res = pii_detector_agent(req.message)

        return JSONResponse({
            "reply": (
                f"Detected PII - Emails: {len(res['emails'])}, Phones: {len(res['phones'])}, "
                f"LinkedIn: {len(res['linkedin'])}, GitHub: {len(res['github'])}, "
                f"Names: {len(res['names'])}, Locations: {len(res['locations'])}, "
                f"URLs: {len(res['urls'])}, SSN: {len(res['ssn'])}"
            )
        })

    return JSONResponse({
        "reply": summarizer_agent(req.message)
    })


# --------------------------------
# Upload + AI Analysis
# --------------------------------

@app.post("/chat/upload")
async def chat_upload(file: UploadFile = File(...)):

    uid = uuid.uuid4().hex
    safe_name = f"{uid}_{file.filename}"

    dest = os.path.join(UPLOAD_DIR, safe_name)

    async with aiofiles.open(dest, "wb") as f:

        while True:

            chunk = await file.read(1024 * 1024)

            if not chunk:
                break

            await f.write(chunk)

    content = extract_text_from_file(dest)

    if content.startswith("ERROR:"):
        return JSONResponse(
            status_code=400,
            content={"detail": content}
        )

    dataset_type = detect_dataset_type(file.filename, content)

    # Use Rule-Based Detection instead of OpenAI
    regex_res = pii_detector_agent(content, dataset_type)
    pii_counts = regex_res["counts"]
    
    total_found = sum(len(v) for k, v in regex_res.items() if isinstance(v, list) and k != "detailed_findings")
    
    remediation = remediation_engine(regex_res)
    
    # Updated Compliance Scoring Logic
    if total_found == 0:
        score = 100
        status = "COMPLIANT"
        risk_level = "LOW"
    else:
        score = max(30, 100 - total_found * 10)
        status = "NON_COMPLIANT"
        # Determine risk level based on severity
        if any(f["severity"] == "Critical" for f in regex_res["detailed_findings"]):
            risk_level = "CRITICAL"
        elif any(f["severity"] == "High" for f in regex_res["detailed_findings"]) or total_found > 10:
            risk_level = "HIGH"
        else:
            risk_level = "MEDIUM"

    ai_result = {
        "compliance_status": status,
        "risk_level": risk_level,
        "compliance_score": score,
        "pii_detected": pii_counts,
        "violated_regulations": ["GDPR", "ISO27001"] if total_found > 0 else [],
        "risk_items": total_found,
        "remediation": remediation
    }
    
    # Update ai_result counts with regex findings
    pii_counts = ai_result.get("pii_detected", {})
    if not isinstance(pii_counts, dict): pii_counts = {}
    
    # Map regex keys to keys expected by frontend/DB
    # Map regex keys to keys expected by frontend/DB/CSV
    pii_counts["email"] = len(regex_res["emails"])
    pii_counts["phone_number"] = len(regex_res["phones"])
    pii_counts["linkedin"] = len(regex_res["linkedin"])
    pii_counts["github"] = len(regex_res["github"])
    pii_counts["names"] = len(regex_res["names"])
    pii_counts["locations"] = len(regex_res["locations"])
    pii_counts["urls"] = len(regex_res["urls"])
    pii_counts["ssn"] = len(regex_res["ssn"])
    pii_counts["api_keys"] = len(regex_res["api_keys"])
    pii_counts["passwords"] = len(regex_res["passwords"])

    # Recalculate total risk items
    total_found = sum(pii_counts.values())
    
    db_record = ComplianceAnalysisResult(
        document_name=file.filename,
        dataset_type=dataset_type,
        compliance_status=ai_result.get("compliance_status"),
        risk_level="CRITICAL" if total_found > 10 else ai_result.get("risk_level"),
        compliance_score=max(0, 100 - (total_found * 5)) if total_found > 0 else ai_result.get("compliance_score"),
        pii_detected=pii_counts,
        violated_regulations=ai_result.get("violated_regulations"),
        risk_items=total_found,
        remediation_actions=ai_result.get("remediation")
    )

    # Merge results back into ai_result for the response
    ai_result.update({
        **regex_res,
        "counts": pii_counts,
        "pii_detected": pii_counts,
        "risk_items": total_found,
        "compliance_score": db_record.compliance_score,
        "risk_level": db_record.risk_level,
        "remediation_actions": remediation,
        "dataset_type": dataset_type
    })

    # MongoDB insert wrapped in try so backend doesn't crash
    try:
        db = get_database()

        await db[ANALYSIS_COLLECTION].insert_one(
            db_record.model_dump(by_alias=True, exclude={"id"})
        )
    except:
        pass

    _record_activity(
        kind="file_uploaded",
        title=f"File analyzed: {file.filename}"
    )

    return JSONResponse(content=jsonable_encoder({
        "message": "File analyzed successfully",
        "report": {
            "ai_analysis": ai_result,
            "summary": ai_result.get("summary") or f"Analysis of {file.filename} complete. Found {total_found} PII items."
        }
    }))


# --------------------------------
# Metrics
# --------------------------------

@app.get("/metrics")
async def metrics():

    return {
        "trend": METRICS_TREND,
        "distribution": DISTRIBUTION_COUNTER,
        "categories": CATEGORY_COUNTER
    }


# --------------------------------
# CSV Export for Current Analysis
# --------------------------------

from fastapi import Response
from typing import Dict, Any

@app.post("/metrics/export/analysis")
async def export_analysis_latest(result: Dict[str, Any]):
    # Extract data for CSV
    ai = result.get("report", {}).get("ai_analysis", {})
    filename = result.get("filename", "unknown_file")
    
    risk_score = ai.get("compliance_score", 0)
    risk_level = ai.get("risk_level", "UNKNOWN")
    compliance_status = ai.get("compliance_status", "UNKNOWN")
    
    counts = ai.get("counts", {})
    
    csv_header = "filename,risk_score,risk_level,compliance_status,email_count,phone_count,linkedin_count,github_count,names_count,locations_count\n"
    csv_row = (
        f"{filename},"
        f"{risk_score},"
        f"{risk_level},"
        f"{compliance_status},"
        f"{counts.get('email', 0)},"
        f"{counts.get('phone_number', 0)},"
        f"{counts.get('linkedin', 0)},"
        f"{counts.get('github', 0)},"
        f"{counts.get('names', 0)},"
        f"{counts.get('locations', 0)}\n"
    )
    
    content = csv_header + csv_row
    
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=analysis_export_{filename}.csv"}
    )

@app.get("/activity")
async def get_activity():

    return ACTIVITY