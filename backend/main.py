import os
import json
import urllib.request
import urllib.error
import urllib.parse
import base64
import re
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
import html
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Body, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import access
import db
import leads
from security import require_admin, ai_limit, form_limit, access_limit

from curriculum_data import MODULES

# Load .env file automatically
def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k, v = k.strip(), v.strip().strip('"').strip("'")
                    if k and v:
                        os.environ.setdefault(k, v)  # real environment settings win over the file

load_env_file()

# ==============================================================================
# ADMIN NOTIFICATION HELPERS
# ==============================================================================

LAST_EMAIL_ERROR = None

def send_email_notification(record: dict) -> bool:
    """
    Sends an email notification to the admin.
    Supports 3 methods in order of preference:
    1. Resend API (HTTP Port 443 - Recommended for Render free tier)
    2. Web3Forms API (HTTP Port 443 - Free transactional form forwarder)
    3. Gmail SMTP (Port 587 - Works on localhost or paid hosts, blocked on Render free tier)
    """
    global LAST_EMAIL_ERROR
    LAST_EMAIL_ERROR = None
    admin_recipient = os.environ.get("ADMIN_EMAIL", "kreomax9@gmail.com").strip()
    subject = f"🎓 New Kreomax Lead: {record['studentName']} – {record['planName']}"

    esc = {k: html.escape(str(v)) for k, v in record.items()}
    html_body = f"""
    <html><body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
      <div style="max-width:520px; margin:auto; background:#fff; border-radius:10px; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color:#6c3fcf; margin-top:0;">🎓 New Student Application</h2>
        <table style="width:100%; border-collapse:collapse; font-size:15px;">
          <tr><td style="padding:8px 0; color:#888; width:130px;">Application ID</td><td style="font-weight:bold; color:#333;">{esc['applicationId']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Student Name</td><td style="font-weight:bold; color:#333;">{esc['studentName']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Phone</td><td style="color:#333;">{esc['studentPhone']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Email</td><td style="color:#333;">{esc.get('studentEmail') or 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Grade</td><td style="color:#333;">{esc.get('studentGrade', 'N/A')}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Plan</td><td style="color:#2ecc71; font-weight:bold;">{esc['planName']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Status</td><td style="color:#e67e22; font-weight:bold;">Pending Consultation</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Submitted At</td><td style="color:#333;">{time.strftime('%d %b %Y at %I:%M %p IST')}</td></tr>
        </table>
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        <p style="color:#888; font-size:13px; margin:0;">This is an automated notification from Kreomax Cognitive Academy.</p>
      </div>
    </body></html>
    """

    # ── Method 1: Web3Forms HTTP API (Port 443 - Zero-setup, direct to inbox) ─────
    web3_key = os.environ.get("WEB3FORMS_ACCESS_KEY", "").strip()
    if web3_key:
        try:
            valid_email = record.get('studentEmail') if (record.get('studentEmail') and '@' in record.get('studentEmail')) else admin_recipient
            w3_data = json.dumps({
                "access_key": web3_key,
                "subject": subject,
                "from_name": "Kreomax Admissions",
                "name": record['studentName'],
                "phone": record['studentPhone'],
                "email": valid_email,
                "message": f"Student: {record['studentName']} | Phone: {record['studentPhone']} | Grade: {record.get('studentGrade', 'N/A')} | Plan: {record['planName']} | App ID: {record['applicationId']}",
                "grade": record.get('studentGrade', 'N/A'),
                "plan": record['planName'],
                "applicationId": record['applicationId']
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.web3forms.com/submit",
                data=w3_data,
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Origin": "https://kreomax.vercel.app",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_json = json.loads(resp.read().decode("utf-8", errors="ignore"))
                if resp_json.get("success"):
                    print(f"[Email Notify: Web3Forms] Successfully delivered to {admin_recipient}")
                    return True
                else:
                    LAST_EMAIL_ERROR = f"Web3Forms response: {resp_json}"
                    print(f"[Email Notify Web3Forms message]: {resp_json}")
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            LAST_EMAIL_ERROR = f"Web3Forms HTTP {e.code}: {err_body}"
            print(f"[Email Notify Error - Web3Forms]: {LAST_EMAIL_ERROR}")
        except Exception as e:
            LAST_EMAIL_ERROR = f"Web3Forms Error: {e}"
            print(f"[Email Notify Error - Web3Forms]: {e}")

    # ── Method 2: Resend HTTP API (Port 443 - For verified domains) ──────────
    resend_key = os.environ.get("RESEND_API_KEY", "").strip()
    if resend_key:
        try:
            req_data = json.dumps({
                "from": "Kreomax Leads <onboarding@resend.dev>",
                "to": [admin_recipient],
                "subject": subject,
                "html": html_body
            }).encode("utf-8")
            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=req_data,
                headers={
                    "Authorization": f"Bearer {resend_key}",
                    "Content-Type": "application/json"
                }
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    print(f"[Email Notify: Resend] Successfully delivered to {admin_recipient}")
                    return True
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="ignore")
            LAST_EMAIL_ERROR = f"Resend HTTP {e.code}: {err_body}"
            print(f"[Email Notify Error - Resend]: {LAST_EMAIL_ERROR}")
        except Exception as e:
            LAST_EMAIL_ERROR = f"Resend Error: {e}"
            print(f"[Email Notify Error - Resend]: {e}")

    # ── Method 3: Gmail SMTP (Direct socket connection) ─────────────────────
    sender = os.environ.get("GMAIL_SENDER_EMAIL", "").strip()
    password = os.environ.get("GMAIL_APP_PASSWORD", "").strip().replace(" ", "")

    if not sender or not password:
        print("[Email Notify] Skipped: No email service credentials configured (RESEND_API_KEY, WEB3FORMS_ACCESS_KEY, or GMAIL_APP_PASSWORD).")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = admin_recipient
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, admin_recipient, msg.as_string())

        print(f"[Email Notify: SMTP] Email sent to {admin_recipient}")
        return True
    except Exception as e:
        print(f"[Email Notify Error - SMTP]: {e}")
        return False

# Master Multi-Tool Gateway Keys (Managed by LMS, zero student logins needed)
GATEWAY_KEYS = {
    "gemini": os.environ.get("GEMINI_API_KEY", ""),
    "openai": os.environ.get("OPENAI_API_KEY", ""),
    "elevenlabs": os.environ.get("ELEVENLABS_API_KEY", "")
}
CUSTOM_API_KEY = GATEWAY_KEYS["gemini"]

@asynccontextmanager
async def lifespan(_app):
    # Create the tables if needed, and bring in leads from the old JSON file once.
    try:
        db.init_db()
        imported = leads.import_legacy(os.path.join(os.path.dirname(__file__), "leads_data.json"))
        print(f"[Database] Using {db.describe()}" + (f" (imported {imported} earlier enquiries)" if imported else ""))
    except Exception as e:  # keep the API up so the problem is visible in the logs
        print(f"[Database ERROR] {e}")
    yield


app = FastAPI(
    title="Cognitive Academy API",
    description="24-Hour Multimodal AI LMS & Creator Suite Backend",
    version="1.2.0",
    lifespan=lifespan,
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:4173"
    ).split(",") if o.strip()],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-Admin-Token", "X-Access-Code"],
)

# In-memory session store for learner profile & progress (with persistent fallback)
LEARNER_PROFILE = {
    "userId": "anonymous",
    "name": "Creator",
    "email": "",
    "role": "Student creator",
    "school": "",
    "avatar": "",
    "completedHours": [],
    "activeHour": 1,
    "theme": "My AI Adventure",
    "assets": {
        "researchBrief": None,
        "storyScript": None,
        "visualPromptPack": None,
        "conceptArtImages": [],
        "videoReel": None,
        "websiteCode": None
    }
}

class ProgressUpdate(BaseModel):
    hour: int
    completed: bool
    assetData: Optional[Dict[str, Any]] = None

class ThemeUpdate(BaseModel):
    theme: str

@app.get("/api/health")
def health_check():
    return {"status": "ok", "platform": "Cognitive Academy", "total_hours": 24}

@app.get("/api/curriculum")
def get_curriculum():
    """Return all 6 modules and their 24 hours of structured curriculum"""
    import curriculum_data
    import importlib
    importlib.reload(curriculum_data)
    modules = curriculum_data.MODULES
    total_hours = sum(len(m["hoursList"]) for m in modules)
    return {
        "modules": modules,
        "totalModules": len(modules),
        "totalHours": total_hours
    }

@app.get("/api/curriculum/module/{module_id}")
def get_module(module_id: str):
    for m in MODULES:
        if m["id"] == module_id:
            return m
    raise HTTPException(status_code=404, detail="Module not found")

@app.get("/api/curriculum/hour/{hour_num}")
def get_hour(hour_num: int):
    for m in MODULES:
        for h in m["hoursList"]:
            if h["hour"] == hour_num:
                return {
                    "module": {
                        "id": m["id"],
                        "number": m["number"],
                        "title": m["title"],
                        "tool": m["tool"],
                        "color": m["color"]
                    },
                    "hour": h
                }
    raise HTTPException(status_code=404, detail="Hour not found")

@app.get("/api/user/profile")
def get_user_profile():
    completed_count = len(LEARNER_PROFILE["completedHours"])
    progress_pct = round((completed_count / 24) * 100)
    return {
        **LEARNER_PROFILE,
        "completedCount": completed_count,
        "progressPct": progress_pct
    }

@app.post("/api/user/progress")
def update_progress(data: ProgressUpdate):
    hour = data.hour
    if data.completed:
        if hour not in LEARNER_PROFILE["completedHours"]:
            LEARNER_PROFILE["completedHours"].append(hour)
            LEARNER_PROFILE["completedHours"].sort()
    else:
        if hour in LEARNER_PROFILE["completedHours"]:
            LEARNER_PROFILE["completedHours"].remove(hour)
    
    if data.assetData:
        for key, val in data.assetData.items():
            if key in LEARNER_PROFILE["assets"]:
                LEARNER_PROFILE["assets"][key] = val

    LEARNER_PROFILE["activeHour"] = min(24, max(1, hour + (1 if data.completed else 0)))
    
    completed_count = len(LEARNER_PROFILE["completedHours"])
    progress_pct = round((completed_count / 24) * 100)
    
    return {
        "success": True,
        "completedHours": LEARNER_PROFILE["completedHours"],
        "activeHour": LEARNER_PROFILE["activeHour"],
        "completedCount": completed_count,
        "progressPct": progress_pct
    }

@app.post("/api/user/theme")
def set_theme(data: ThemeUpdate):
    LEARNER_PROFILE["theme"] = data.theme
    return {"success": True, "theme": data.theme}

# --- Multi-Tool LMS Gateway Helpers ---

def get_active_gemini_key(user_key: Optional[str] = None) -> str:
    global GATEWAY_KEYS
    if user_key and user_key.strip():
        return user_key.strip()
    return GATEWAY_KEYS.get("gemini") or os.environ.get("GEMINI_API_KEY", "").strip()

def get_active_openai_key(user_key: Optional[str] = None) -> str:
    global GATEWAY_KEYS
    if user_key and user_key.strip():
        return user_key.strip()
    return GATEWAY_KEYS.get("openai") or os.environ.get("OPENAI_API_KEY", "").strip()

def get_active_elevenlabs_key(user_key: Optional[str] = None) -> str:
    global GATEWAY_KEYS
    if user_key and user_key.strip():
        return user_key.strip()
    return GATEWAY_KEYS.get("elevenlabs") or os.environ.get("ELEVENLABS_API_KEY", "").strip()

# 1. Google Gemini 1.5 Handler (with retry)
def call_gemini(prompt: str, system_instruction: str = "", api_key: str = None, retries: int = 2) -> Optional[str]:
    key = get_active_gemini_key(api_key)
    if not key:
        return None
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1200}
    }
    if system_instruction:
        payload["systemInstruction"] = {"parts": [{"text": system_instruction}]}
    
    for attempt in range(retries + 1):
        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=req_data, headers={"Content-Type": "application/json"}, method="POST")
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                candidates = data.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "")
        except urllib.error.URLError as e:
            print(f"[Gemini Network Error attempt {attempt+1}/{retries+1}]: {e}")
            if attempt < retries:
                import time; time.sleep(1.5)
        except Exception as e:
            print(f"[Gemini API Error]: {e}")
            return None
    return None

# 2. OpenAI / ChatGPT Handler (with retry)
def call_openai_chat(prompt: str, system_instruction: str = "", api_key: str = None, model: str = "gpt-4o-mini", retries: int = 2) -> Optional[str]:
    key = get_active_openai_key(api_key)
    if not key:
        return None
    url = "https://api.openai.com/v1/chat/completions"
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    messages.append({"role": "user", "content": prompt})
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1200
    }
    for attempt in range(retries + 1):
        try:
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {key}"
                },
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                choices = data.get("choices", [])
                if choices:
                    return choices[0].get("message", {}).get("content", "")
        except urllib.error.URLError as e:
            print(f"[OpenAI Network Error attempt {attempt+1}/{retries+1}]: {e}")
            if attempt < retries:
                import time; time.sleep(1.5)
        except Exception as e:
            print(f"[OpenAI API Error]: {e}")
            return None
    return None

# 3. ElevenLabs Text-To-Speech Handler
def call_elevenlabs_tts(text: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM", api_key: str = None) -> Optional[str]:
    key = get_active_elevenlabs_key(api_key)
    if not key:
        return None
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
    payload = {
        "text": text[:800],
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75
        }
    }
    try:
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "xi-api-key": key,
                "Accept": "audio/mpeg"
            },
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=18) as resp:
            audio_bytes = resp.read()
            b64_audio = base64.b64encode(audio_bytes).decode("utf-8")
            return f"data:audio/mp3;base64,{b64_audio}"
    except Exception as e:
        print(f"[ElevenLabs API Notice]: {e}")
        return None
    return None

# 4. Real AI Image Generator (Instant 16:9 4K concept art)
def generate_ai_image(prompt: str, seed: int = 42) -> str:
    clean = prompt.replace("--ar 16:9", "").replace("--v 6.1", "").replace("--style raw", "").strip()
    encoded = urllib.parse.quote(clean)
    return f"https://image.pollinations.ai/prompt/{encoded}?width=1280&height=720&nologo=true&seed={seed}"

# --- LMS Gateway Status & Key Management ---

@app.get("/api/ai/gateway/status")
def gateway_status():
    g_key = get_active_gemini_key()
    o_key = get_active_openai_key()
    e_key = get_active_elevenlabs_key()

    def mask(k):
        return ("••••" + k[-4:]) if (k and len(k) > 10) else ""

    return {
        "sso": True,
        "platform": "Cognitive Academy Unified Gateway",
        "tools": {
            "gemini": {
                "name": "Google Gemini 1.5 Flash",
                "role": "Level 1 NotebookLM Grounding & Level 2 Screenplay",
                "configured": bool(g_key),
                "maskedKey": mask(g_key),
                "isFreeTier": True,
                "portalUrl": "https://aistudio.google.com/app/apikey"
            },
            "chatgpt": {
                "name": "OpenAI ChatGPT (GPT-4o)",
                "role": "Level 2 Story Studio & Scriptwriting",
                "configured": bool(o_key),
                "maskedKey": mask(o_key),
                "isFreeTier": False,
                "portalUrl": "https://platform.openai.com/api-keys"
            },
            "notebooklm": {
                "name": "Google NotebookLM Grounded Lab",
                "role": "Level 1 Verified RAG Research",
                "configured": bool(g_key),
                "engine": "Gemini 1.5 Grounded Citation Engine"
            },
            "elevenlabs": {
                "name": "ElevenLabs Voice AI",
                "role": "Audio Overview Podcast & Movie Trailer Voiceover",
                "configured": bool(e_key),
                "maskedKey": mask(e_key),
                "isFreeTier": True,
                "portalUrl": "https://elevenlabs.io/app/settings/api-keys"
            },
            "imageGen": {
                "name": "AI Concept Art Engine",
                "role": "Level 3 Digital Art Studio",
                "configured": True,
                "engine": "Pollinations.ai / DALL-E Real Image Stream"
            }
        }
    }

@app.post("/api/ai/gateway/save-keys", dependencies=[Depends(require_admin)])
def save_gateway_keys(payload: Dict[str, str] = Body(...)):
    global GATEWAY_KEYS, CUSTOM_API_KEY
    if "gemini" in payload:
        GATEWAY_KEYS["gemini"] = payload["gemini"].strip()
        CUSTOM_API_KEY = GATEWAY_KEYS["gemini"]
        os.environ["GEMINI_API_KEY"] = GATEWAY_KEYS["gemini"]
    if "openai" in payload:
        GATEWAY_KEYS["openai"] = payload["openai"].strip()
        os.environ["OPENAI_API_KEY"] = GATEWAY_KEYS["openai"]
    if "elevenlabs" in payload:
        GATEWAY_KEYS["elevenlabs"] = payload["elevenlabs"].strip()
        os.environ["ELEVENLABS_API_KEY"] = GATEWAY_KEYS["elevenlabs"]

    # Write to backend .env so it persists across restarts
    try:
        env_path = os.path.join(os.path.dirname(__file__), ".env")
        with open(env_path, "w", encoding="utf-8") as f:
            f.write("# Cognitive Academy - Master LMS AI Gateway Keys\n")
            f.write(f"GEMINI_API_KEY={GATEWAY_KEYS.get('gemini', '')}\n")
            f.write(f"OPENAI_API_KEY={GATEWAY_KEYS.get('openai', '')}\n")
            f.write(f"ELEVENLABS_API_KEY={GATEWAY_KEYS.get('elevenlabs', '')}\n")
    except Exception as e:
        print(f"[Could not write .env]: {e}")

    return {
        "success": True,
        "message": "Gateway keys updated successfully! All tools inside the LMS now use these master credentials.",
        "status": gateway_status()
    }

# Backward compatibility endpoints for gemini-status and set-key
@app.get("/api/ai/gemini-status")
def gemini_status():
    active_key = get_active_gemini_key()
    has_key = bool(active_key)
    masked_key = ("••••" + active_key[-4:]) if (has_key and len(active_key) > 10) else ""
    return {
        "configured": has_key,
        "maskedKey": masked_key,
        "model": "Google Gemini 1.5 Flash (Free Tier)",
        "source": "LMS Backend Proxy"
    }

@app.post("/api/ai/set-key", dependencies=[Depends(require_admin)])
def set_gemini_key(payload: Dict[str, str] = Body(...)):
    return save_gateway_keys({"gemini": payload.get("apiKey", "")})

# ElevenLabs Voiceover endpoint
@app.post("/api/ai/elevenlabs-voice", dependencies=[Depends(ai_limit), Depends(access.require_access)])
def generate_elevenlabs_voice(payload: Dict[str, Any] = Body(...)):
    text = payload.get("text", "Welcome to Cognitive Academy.")
    voice_type = payload.get("voiceType", "elena")
    
    voice_map = {
        "elena": "21m00Tcm4TlvDq8ikWAM",   # Rachel (Calm, articulate)
        "marcus": "ErXwobaYiN019PkySvjV",  # Antoni (Energetic co-host)
        "narrator": "JBFqnCBsd6RMkjVDRZzb" # George (Cinematic trailer narrator)
    }
    voice_id = voice_map.get(voice_type, "21m00Tcm4TlvDq8ikWAM")
    
    audio_data_uri = call_elevenlabs_tts(text=text, voice_id=voice_id)
    if audio_data_uri:
        return {
            "status": "success",
            "source": "elevenlabs",
            "audioUrl": audio_data_uri,
            "voiceId": voice_id
        }
    
    return {
        "status": "fallback",
        "source": "browser-speech-fallback",
        "audioUrl": None,
        "message": "ElevenLabs API key not set. Using browser speech synthesis."
    }

# Real Image Generation endpoint
@app.post("/api/ai/image-generate", dependencies=[Depends(ai_limit), Depends(access.require_access)])
def generate_image_endpoint(payload: Dict[str, Any] = Body(...)):
    prompt = payload.get("prompt", "futuristic cyberpunk city")
    scene_number = payload.get("sceneNumber", 1)
    seed = payload.get("seed", 40 + scene_number)
    
    img_url = generate_ai_image(prompt=prompt, seed=seed)
    return {
        "status": "success",
        "imageUrl": img_url,
        "prompt": prompt,
        "sceneNumber": scene_number
    }


# Grounded NotebookLM Chat Endpoint
@app.post("/api/ai/notebooklm-chat", dependencies=[Depends(ai_limit), Depends(access.require_access)])
def notebooklm_chat(payload: Dict[str, Any] = Body(...)):
    query = payload.get("query", "").strip()
    sources = payload.get("sources", [])
    api_key = payload.get("apiKey")
    theme = payload.get("theme", "Story World")

    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    formatted_sources = []
    for s in sources:
        sid = s.get("id", 1)
        stitle = s.get("title", f"Doc {sid}")
        scontent = s.get("content", "")
        formatted_sources.append(f"[Document ID: {sid} | Title: {stitle}]\n{scontent}\n")
    sources_text = "\n".join(formatted_sources)

    gemini_key = get_active_gemini_key(api_key)
    if gemini_key:
        prompt = f"""You are Google NotebookLM acting as an embedded grounded AI research assistant for students (aged 12+).
The student uploaded the following source documents:
{sources_text}

The student asked:
"{query}"

Grounding Rules:
1. Answer strictly based on the provided documents. Never make up facts.
2. Cite the exact sentence or proof snippet directly copied from the text.
3. Respond ONLY in valid JSON with this exact schema without markdown code fences:
{{
  "answer": "Friendly, clear, age-appropriate answer",
  "docId": <integer matching the document ID cited>,
  "docName": "<title of the cited document>",
  "citedText": "<exact text from the document proving the fact>"
}}"""

        ai_resp = call_gemini(
            prompt=prompt, 
            system_instruction="You are Google NotebookLM. Ground answers strictly in provided documents with direct citations. Return only valid JSON.",
            api_key=gemini_key
        )

        if ai_resp:
            try:
                cleaned = ai_resp.strip()
                if cleaned.startswith("```"):
                    cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
                    cleaned = re.sub(r"\n?```$", "", cleaned)
                data = json.loads(cleaned.strip())
                return {
                    "status": "success",
                    "source": "gemini-1.5-flash",
                    "answer": data.get("answer", ""),
                    "citation": {
                        "docId": data.get("docId", 1),
                        "docName": data.get("docName", "Source Note"),
                        "text": data.get("citedText", "")
                    }
                }
            except Exception as e:
                print(f"[Gemini NotebookLM Parse Error]: {e}")

    # Fallback to local grounded text search
    q_lower = query.lower()
    matched_doc = sources[0] if sources else None
    matched_sentence = ""

    if sources:
        for doc in sources:
            content = doc.get("content", "")
            sentences = [s.strip() for s in content.split(".") if s.strip()]
            for sentence in sentences:
                words = [w for w in q_lower.split() if len(w) > 3]
                if any(w in sentence.lower() for w in words):
                    matched_doc = doc
                    matched_sentence = sentence
                    break
            if matched_sentence:
                break

    if not matched_sentence and sources:
        matched_doc = sources[0]
        first_period = matched_doc.get("content", "").find(".")
        matched_sentence = matched_doc.get("content", "")[:first_period] if first_period > 0 else matched_doc.get("content", "")

    doc_name = matched_doc.get("title", "Doc 1") if matched_doc else "Uploaded Notes"
    doc_id = matched_doc.get("id", 1) if matched_doc else 1
    
    if "drone" in q_lower or "avoid" in q_lower or "jacket" in q_lower:
        answer_text = f"According to {doc_name}, you can evade patrol drones using anti-glare reflector jackets, which prevent electronic scanners from detecting you."
    elif "gadget" in q_lower or "lens" in q_lower or "spire" in q_lower:
        answer_text = f"According to {doc_name}, detectives scan metal walls for electronic footprints using cyber-lenses, while the central spire provides power to all sectors."
    else:
        answer_text = f"Based on your notes in {doc_name}: '{matched_sentence}'. This provides verified proof for your story!"

    return {
        "status": "success",
        "source": "smart-grounded-fallback",
        "answer": answer_text,
        "citation": {
            "docId": doc_id,
            "docName": doc_name,
            "text": matched_sentence
        }
    }

# Grounded Story Generation Endpoint
@app.post("/api/ai/story-generate", dependencies=[Depends(ai_limit), Depends(access.require_access)])
def generate_story(payload: Dict[str, Any] = Body(...)):
    theme = payload.get("theme", "Neo-Tokyo 2099 Cyberpunk")
    archetype = payload.get("archetype", "Cyber Detective")
    provider = payload.get("provider", "chatgpt").lower()
    api_key = payload.get("apiKey")

    prompt = f"""You are a Hollywood screenplay and creative writing mentor for a 12-16 year old student.
Story Theme: "{theme}"
Character Archetype: "{archetype}"

Create an engaging 4-scene screenplay breakdown.
Respond ONLY with valid JSON in this exact structure without markdown backticks:
{{
  "character": {{
    "name": "<Hero Name>",
    "archetype": "{archetype}",
    "flaw": "<A relatable heroic flaw>",
    "visualSilhouette": "<Visual description for concept art>"
  }},
  "scenes": [
    {{
      "sceneNumber": 1,
      "title": "<Scene Title>",
      "slugline": "EXT. LOCATION - DAY",
      "action": "<Visual cinematic action, 2 sentences>",
      "dialogue": "CHARACTER: 'Memorable line of dialogue'",
      "visualPrompt": "<Midjourney prompt ending with --ar 16:9 --style raw>"
    }},
    {{
      "sceneNumber": 2,
      "title": "<Scene Title>",
      "slugline": "INT. LOCATION - NIGHT",
      "action": "<Visual cinematic action, 2 sentences>",
      "dialogue": "CHARACTER: 'Memorable line of dialogue'",
      "visualPrompt": "<Midjourney prompt ending with --ar 16:9>"
    }},
    {{
      "sceneNumber": 3,
      "title": "<Scene Title>",
      "slugline": "EXT. LOCATION - MIDNIGHT",
      "action": "<Visual cinematic action, 2 sentences>",
      "dialogue": "CHARACTER: 'Memorable line of dialogue'",
      "visualPrompt": "<Midjourney prompt ending with --ar 16:9>"
    }},
    {{
      "sceneNumber": 4,
      "title": "<Scene Title>",
      "slugline": "INT. LOCATION - DAWN",
      "action": "<Visual cinematic action, 2 sentences>",
      "dialogue": "CHARACTER: 'Memorable line of dialogue'",
      "visualPrompt": "<Midjourney prompt ending with --ar 16:9 --v 6.1>"
    }}
  ]
}}"""

    ai_resp = None
    engine_used = "curated-template"

    # 1. Try ChatGPT if requested or configured
    if provider == "chatgpt":
        openai_key = get_active_openai_key(api_key)
        if openai_key:
            ai_resp = call_openai_chat(prompt=prompt, system_instruction="You are a professional film screenwriter and tutor. Return only valid JSON.", api_key=openai_key)
            if ai_resp:
                engine_used = "OpenAI ChatGPT (GPT-4o-mini)"

    # 2. Try Gemini if requested or as fallback
    if not ai_resp:
        gemini_key = get_active_gemini_key(api_key)
        if gemini_key:
            ai_resp = call_gemini(prompt=prompt, system_instruction="You are a professional film screenwriter and tutor. Return only valid JSON.", api_key=gemini_key)
            if ai_resp:
                engine_used = "Google Gemini 1.5 Flash"

    if ai_resp:
        try:
            cleaned = ai_resp.strip()
            if cleaned.startswith("```"):
                cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
                cleaned = re.sub(r"\n?```$", "", cleaned)
            data = json.loads(cleaned.strip())
            if "character" in data and "scenes" in data:
                return {
                    "status": "success",
                    "source": engine_used,
                    **data
                }
        except Exception as e:
            print(f"[Story Generation Parse Error]: {e}")

    # Fallback to curated template with Indian hero presets
    hero_name = "Kai Rivera" if "detective" in archetype.lower() or "coder" in archetype.lower() else "Mira Patel"
    return {
        "status": "success",
        "source": "curated-template",
        "character": {
            "name": hero_name,
            "archetype": archetype,
            "flaw": "Tends to jump straight into hacking before checking the security drones!",
            "voice": "Determined, inventive, carries an innovation toolkit.",
            "visualSilhouette": f"Sleek solar hazard suit with a mission patch, glowing holographic scanner tablet, smart specs in {theme}."
        },
        "scenes": [
            {
                "sceneNumber": 1,
                "title": f"The Anomaly in {theme}",
                "slugline": "EXT. SECTOR 4 MONOLITH - DUSK",
                "action": f"Persistent rain slicks the black composite catwalks. {hero_name} inspects an exposed fiber conduit, optic lens adjusting focal depth.",
                "dialogue": f"{hero_name}: 'The signal wasn't lost. Someone intentionally redirected it.'",
                "visualPrompt": f"Cinematic 35mm film still of {hero_name} in {theme}, kneeling on catwalk, atmospheric neon lighting, volumetric mist --ar 16:9 --style raw"
            },
            {
                "sceneNumber": 2,
                "title": "The Hidden Vault",
                "slugline": "INT. SUBTERRANEAN DATA VAULT - NIGHT",
                "action": "Towering racks of liquid-cooled optical drives hum in rhythmic pulses. Amber indicator lights reflect across damp concrete.",
                "dialogue": "ARCHIVIST: 'Truth is dangerous down here. Are you sure you want to open this file?'",
                "visualPrompt": f"Intricate underground server room with glowing blue terminals, amber warning lights, cinematic film lighting in {theme} --ar 16:9"
            },
            {
                "sceneNumber": 3,
                "title": "Pursuit Across the Skyline",
                "slugline": "EXT. SKYRAIL ROOFTOPS - MIDNIGHT",
                "action": "Sleek aerodynamic vehicles slice through low clouds. Searchlights sweep from autonomous pursuit patrol drones overhead.",
                "dialogue": f"{hero_name}: 'We need to disable the tracker before we reach the central tower!'",
                "visualPrompt": f"High-speed rooftop chase through illuminated futuristic city, drone searchlights piercing fog, cinematic motion blur in {theme} --ar 16:9"
            },
            {
                "sceneNumber": 4,
                "title": "The Final Transmission",
                "slugline": "INT. APEX TRANSMITTER DECK - DAWN",
                "action": "Dawn breaks in shades of violet and gold. The transmission terminal pulses white light as the broadcast completes.",
                "dialogue": f"{hero_name}: 'Now the whole world knows the truth.'",
                "visualPrompt": f"Apex glass transmitter chamber at sunrise overlooking expansive skyline, golden hour sunlight, solitary silhouette in {theme} --ar 16:9 --v 6.1"
            }
        ]
    }

class TrainerChatRequest(BaseModel):
    message: str
    currentLevel: int = 1
    projectTheme: str = "Mission Chandrayaan 2085"
    heroContext: Optional[Dict[str, Any]] = None
    apiKey: Optional[str] = None

@app.post("/api/ai/trainer-chat", dependencies=[Depends(ai_limit), Depends(access.require_access)])
async def trainer_chat(req: TrainerChatRequest):
    """
    Dedicated AI Mentor / Trainer endpoint for Cognitive Academy LMS.
    Guides students through prompt engineering, storytelling, research, art, and capstone review.
    """
    system_prompt = f"""You are the Senior AI Lead Mentor at Kreomax Creator Studio.
You are mentoring a bright student creator working on their 24-Hour AI Creator Journey.
The student is currently working on:
- Active Level: Level {req.currentLevel}
- Project Mission: {req.projectTheme}
{"- Student's Hero: " + str(req.heroContext) if req.heroContext else ""}

Your mentoring guidelines:
1. Be warmly encouraging, inspiring, and clear (like a world-class creative studio director).
2. Give actionable, concrete advice on prompt engineering, storytelling, or AI tools.
3. Keep your response concise (3-4 short paragraphs maximum) with clear bullet points.
4. If they ask about prompt engineering, teach the 4-part formula: Role + Context + Task + Constraints.
5. Emphasize original thinking: encourage the student to own their story, embrace creative flaws, and avoid generic clichés.
"""

    gemini_key = get_active_gemini_key(req.apiKey)
    openai_key = get_active_openai_key(req.apiKey)
    mentor_reply = None

    if openai_key:
        mentor_reply = call_openai_chat(prompt=req.message, system_instruction=system_prompt, api_key=openai_key)
    if not mentor_reply and gemini_key:
        mentor_reply = call_gemini(prompt=req.message, system_instruction=system_prompt, api_key=gemini_key)

    if not mentor_reply:
        # Intelligent contextual fallback
        lvl = req.currentLevel
        msg = req.message.lower()
        if "hero" in msg or "character" in msg or lvl == 1:
            mentor_reply = (
                f"Namaste! AI Studio Mentor here. I love the ambition of your {req.projectTheme} project!\n\n"
                "Here is my top mentor advice for your hero in Level 1:\n"
                "• **Give them a vulnerability**: A hero who is too perfect is boring! For example, maybe your cadet is brilliant at AI code but gets claustrophobic in airlocks.\n"
                "• **Use the 4-Part Prompt Formula**: Role (Master Screenwriter) + Context (Lunar Crater Malapert) + Task (4 tense scenes) + Constraints (punchy dialogue, funny moment).\n"
                "• **Test your prompt in ChatGPT**: Once you have the prompt, run it and refine the dialogue line-by-line. You are the director!"
            )
        elif "research" in msg or "fact" in msg or lvl == 2:
            mentor_reply = (
                f"Great question! Grounding sci-fi in real facts is what separates amateur fiction from unforgettable cinema.\n\n"
                "• **Use Citations**: Notice the research source tags next to answers. That proves your research isn't an AI hallucination.\n"
                "• **Connect Fact to Drama**: Did you know the Lunar South Pole drops to -200°C? Use that as a plot ticking-clock in Scene 2!"
            )
        else:
            mentor_reply = (
                f"Fantastic progress! As your studio mentor, I'm watching your creator portfolio take shape.\n\n"
                "Remember our golden rule: AI is your creative co-pilot, but **you** make the executive decisions. "
                "Keep refining your prompt rules and inspect every output before saving to your capstone vault."
            )

    return {
        "status": "success",
        "trainer": {
            "name": "AI Studio Mentor",
            "title": "AI guide for your project",
            "avatar": "",
            "status": "Online & Mentoring 🟢"
        },
        "reply": mentor_reply,
        "currentLevel": req.currentLevel
    }

# ==============================================================================
# PROGRAMMES (no online payments: fees are shared on enquiry)
# ==============================================================================

PROGRAMMES = [
    {
        "id": "cohort-24h",
        "name": "Creator Cohort",
        "badge": "Most Popular · Weekends",
        "duration": "24 Hours · 2 Months",
        "schedule": "Weekends (Sat & Sun, 1.5 hrs/day)",
        "description": "Comprehensive weekend masterclass for young creators (12+) building real AI projects in collaborative cohorts.",
        "features": [
            "24 Hours Live Weekend Sessions over 2 Months",
            "Guided Creation across all 6 AI Creator Studios",
            "5 Real Deliverables: Script, Research, Art, Trailer, Website",
            "Live Peer Collaboration & Demo Day Premiere",
            "100-Point Rubric Mentor Evaluation",
            "Kreomax Creator Certificate"
        ],
        "popular": True,
        "cta": "Apply for Creator Cohort"
    },
    {
        "id": "training-1on1-30h",
        "name": "1:1 Creator Mentorship",
        "badge": "Elite Track · Dedicated Mentor",
        "duration": "30 Hours Personalized",
        "schedule": "Flexible 1:1 Schedule (Weekdays / Weekends)",
        "description": "Personalized 1-on-1 private mentoring with an AI specialist customized to student's pace and creative ambition.",
        "features": [
            "30 Hours of Dedicated 1-on-1 Private Sessions",
            "Custom Syllabus (Sci-Fi, Gaming, Anime, Film, or Web)",
            "6 Bonus Hours on Advanced Prompting & Sound Engineering",
            "Direct 1:1 Portfolio Build & Custom Domain Guidance",
            "Priority Capstone Grading & Personalized Video Review",
            "Letter of Recommendation + Certified Creator Credential"
        ],
        "popular": False,
        "cta": "Ask about 1:1 Mentorship"
    }
]

class AdmissionApplicationRequest(BaseModel):
    planId: str = Field(max_length=64)
    planName: Optional[str] = Field(default="Creator Cohort", max_length=120)
    studentName: str = Field(min_length=2, max_length=100)
    studentEmail: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=200)
    studentPhone: str = Field(pattern=r"^[+0-9\s-]{7,16}$")
    studentGrade: Optional[str] = Field(default="Grade 8-12", max_length=40)
    notes: Optional[str] = Field(default="", max_length=1000)

@app.post("/api/admissions/apply", dependencies=[Depends(form_limit)])
async def submit_admission_application(req: AdmissionApplicationRequest):
    """
    Records student pre-registration / admission application.
    Saves the lead to the database, and returns a pre-filled WhatsApp link.
    """
    record = leads.add(
        plan_id=req.planId, plan_name=req.planName, name=req.studentName, email=req.studentEmail,
        phone=req.studentPhone, grade=req.studentGrade, notes=req.notes,
    )
    app_id = record["applicationId"]

    # ── Fire admin email notification (non-blocking, errors are logged not raised) ──
    send_email_notification(record)

    # Generate pre-filled WhatsApp link
    wa_msg = f"Hi Kreomax Admissions! I have submitted application {app_id} for the {req.planName}. My name is {req.studentName} ({req.studentPhone}). Please share batch timings and enrollment info."
    encoded_wa = urllib.parse.quote(wa_msg)
    whatsapp_url = f"https://wa.me/918310590859?text={encoded_wa}"

    return {
        "status": "success",
        "applicationId": app_id,
        "message": "Your application has been received! Our admissions team will contact you shortly.",
        "whatsappUrl": whatsapp_url,
        "record": record
    }

@app.get("/api/admissions/list", dependencies=[Depends(require_admin)])
async def list_admission_applications():
    rows = leads.list_all()
    return {
        "status": "success",
        "count": len(rows),
        "applications": rows
    }

@app.get("/api/admissions/test-email", dependencies=[Depends(require_admin)])
async def test_email_delivery():
    """Diagnostic endpoint to test email delivery."""
    test_record = {
        "applicationId": "TEST-" + str(int(time.time()))[-4:],
        "planName": "Creator Cohort (Diagnostic Test)",
        "studentName": "Live Diagnostic Test",
        "studentEmail": "test@kreomax.ai",
        "studentPhone": "9999999999",
        "studentGrade": "Grade 8"
    }
    success = send_email_notification(test_record)
    return {
        "emailSent": success,
        "configuredProviders": {
            "resend": bool(os.environ.get("RESEND_API_KEY")),
            "web3forms": bool(os.environ.get("WEB3FORMS_ACCESS_KEY")),
            "gmail_smtp": bool(os.environ.get("GMAIL_SENDER_EMAIL") and os.environ.get("GMAIL_APP_PASSWORD"))
        },
        "recipient": os.environ.get("ADMIN_EMAIL", "kreomax9@gmail.com"),
        "lastError": LAST_EMAIL_ERROR
    }

# ==============================================================================
# STUDIO ACCESS (codes the admin sends to approved students)
# ==============================================================================

class AccessCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    phone: str = Field(default="", max_length=20)
    applicationId: Optional[str] = Field(default=None, max_length=40)
    note: str = Field(default="", max_length=300)


class AccessVerify(BaseModel):
    code: str = Field(min_length=1, max_length=20)


@app.post("/api/access/verify", dependencies=[Depends(access_limit)])
async def verify_access(req: AccessVerify):
    """Checks a student's access code. Deliberately gives the same answer for unknown and switched-off codes."""
    rec = access.verify(req.code)
    if not rec:
        raise HTTPException(status_code=401, detail="That code is not valid. Check it and try again.")
    return {"status": "success", "name": rec["name"], "display": rec["display"]}


@app.get("/api/admin/access", dependencies=[Depends(require_admin)])
async def admin_list_access():
    return {"status": "success", "access": access.list_records()}


@app.post("/api/admin/access", dependencies=[Depends(require_admin)])
async def admin_create_access(req: AccessCreate):
    return {"status": "success", "access": access.create(req.name, req.phone, req.applicationId, req.note)}


@app.post("/api/admin/access/{code}/revoke", dependencies=[Depends(require_admin)])
async def admin_revoke_access(code: str):
    rec = access.set_status(code, "revoked")
    if not rec:
        raise HTTPException(status_code=404, detail="Code not found.")
    return {"status": "success", "access": rec}


@app.post("/api/admin/access/{code}/restore", dependencies=[Depends(require_admin)])
async def admin_restore_access(code: str):
    rec = access.set_status(code, "active")
    if not rec:
        raise HTTPException(status_code=404, detail="Code not found.")
    return {"status": "success", "access": rec}

@app.get("/api/public/config")
async def get_public_config():
    """Public, non-secret settings the website needs: the programme list and the enquiry-form key."""
    return {
        "status": "success",
        "plans": PROGRAMMES,
        "web3formsKey": os.environ.get("WEB3FORMS_ACCESS_KEY", "").strip()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)


