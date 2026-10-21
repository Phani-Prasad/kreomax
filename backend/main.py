import os
import json
import urllib.request
import urllib.error
import urllib.parse
import base64
import re
import hmac
import hashlib
import time
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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
                        os.environ[k] = v

load_env_file()

# ==============================================================================
# ADMIN NOTIFICATION HELPERS
# ==============================================================================

def send_email_notification(record: dict) -> bool:
    """
    Sends an email to the admin via Gmail SMTP.
    Requires GMAIL_SENDER_EMAIL, GMAIL_APP_PASSWORD, ADMIN_EMAIL in .env
    """
    sender = os.environ.get("GMAIL_SENDER_EMAIL", "").strip()
    password = os.environ.get("GMAIL_APP_PASSWORD", "").strip().replace(" ", "")  # Google shows App Password with spaces, SMTP needs it without
    recipient = os.environ.get("ADMIN_EMAIL", "kreomax9@gmail.com").strip()

    if not sender or not password:
        print("[Email Notify] Skipped: GMAIL_SENDER_EMAIL or GMAIL_APP_PASSWORD not set in .env")
        return False

    subject = f"🎓 New Kreomax Lead: {record['studentName']} – {record['planName']}"

    html_body = f"""
    <html><body style="font-family: Arial, sans-serif; background:#f5f5f5; padding:20px;">
      <div style="max-width:520px; margin:auto; background:#fff; border-radius:10px; padding:28px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color:#6c3fcf; margin-top:0;">🎓 New Student Application</h2>
        <table style="width:100%; border-collapse:collapse; font-size:15px;">
          <tr><td style="padding:8px 0; color:#888; width:130px;">Application ID</td><td style="font-weight:bold; color:#333;">{record['applicationId']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Student Name</td><td style="font-weight:bold; color:#333;">{record['studentName']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Phone</td><td style="color:#333;">{record['studentPhone']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Email</td><td style="color:#333;">{record.get('studentEmail') or 'Not provided'}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Grade</td><td style="color:#333;">{record.get('studentGrade', 'N/A')}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Plan</td><td style="color:#2ecc71; font-weight:bold;">{record['planName']}</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Status</td><td style="color:#e67e22; font-weight:bold;">Pending Consultation</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Submitted At</td><td style="color:#333;">{time.strftime('%d %b %Y at %I:%M %p IST')}</td></tr>
        </table>
        <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
        <p style="color:#888; font-size:13px; margin:0;">This is an automated notification from Kreomax Cognitive Academy.</p>
      </div>
    </body></html>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = recipient
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, recipient, msg.as_string())

        print(f"[Email Notify] Email sent to {recipient}")
        return True
    except Exception as e:
        print(f"[Email Notify Error]: {e}")
        return False

# Master Multi-Tool Gateway Keys (Managed by LMS, zero student logins needed)
GATEWAY_KEYS = {
    "gemini": os.environ.get("GEMINI_API_KEY", ""),
    "openai": os.environ.get("OPENAI_API_KEY", ""),
    "elevenlabs": os.environ.get("ELEVENLABS_API_KEY", "")
}
CUSTOM_API_KEY = GATEWAY_KEYS["gemini"]

app = FastAPI(
    title="Cognitive Academy API",
    description="24-Hour Multimodal AI LMS & Creator Suite Backend",
    version="1.1.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store for learner profile & progress (with persistent fallback)
LEARNER_PROFILE = {
    "userId": "learner-101",
    "name": "Aarav Sharma",
    "email": "aarav.sharma@atl.gov.in",
    "role": "ATL Student Innovator (Grade 8)",
    "school": "Kendriya Vidyalaya / Bengaluru Public School",
    "avatar": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    "completedHours": [1, 2, 3, 4],  # Demonstrates initial milestone progress
    "activeHour": 5,
    "theme": "🚀 Mission Chandrayaan 2085: Secret of the Lunar Water Vault",
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
        return (k[:6] + "..." + k[-4:]) if (k and len(k) > 10) else ""

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

@app.post("/api/ai/gateway/save-keys")
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
    masked_key = (active_key[:6] + "..." + active_key[-4:]) if (has_key and len(active_key) > 10) else ""
    return {
        "configured": has_key,
        "maskedKey": masked_key,
        "model": "Google Gemini 1.5 Flash (Free Tier)",
        "source": "LMS Backend Proxy"
    }

@app.post("/api/ai/set-key")
def set_gemini_key(payload: Dict[str, str] = Body(...)):
    return save_gateway_keys({"gemini": payload.get("apiKey", "")})

# ElevenLabs Voiceover endpoint
@app.post("/api/ai/elevenlabs-voice")
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
@app.post("/api/ai/image-generate")
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
@app.post("/api/ai/notebooklm-chat")
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
@app.post("/api/ai/story-generate")
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
    hero_name = "Aarav Sharma" if "detective" in archetype.lower() or "coder" in archetype.lower() else "Ananya Patel"
    return {
        "status": "success",
        "source": "curated-template",
        "character": {
            "name": hero_name,
            "archetype": archetype,
            "flaw": "Tends to jump straight into hacking before checking the security drones!",
            "voice": "Determined, inventive, carries an ATL innovation toolkit.",
            "visualSilhouette": f"Sleek solar hazard suit with ISRO patch, glowing holographic scanner tablet, smart specs in {theme}."
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

@app.post("/api/ai/trainer-chat")
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
            "title": "Senior AI Creative Lead & Studio Evaluator",
            "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            "status": "Online & Mentoring 🟢"
        },
        "reply": mentor_reply,
        "currentLevel": req.currentLevel
    }

# ==============================================================================
# RAZORPAY PAYMENT GATEWAY INTEGRATION
# ==============================================================================

# Public pricing plans
PRICING_PLANS = [
    {
        "id": "cohort-24h",
        "name": "Creator Cohort",
        "badge": "Most Popular · Weekends",
        "duration": "24 Hours · 2 Months",
        "schedule": "Weekends (Sat & Sun, 1.5 hrs/day)",
        "price": 4999,
        "originalPrice": 9999,
        "currency": "INR",
        "description": "Comprehensive weekend masterclass for young creators (12+) building real AI projects in collaborative cohorts.",
        "features": [
            "24 Hours Live Weekend Sessions over 2 Months",
            "Guided Creation across all 6 AI Creator Studios",
            "5 Real Deliverables: Script, Research, Art, Trailer, Website",
            "Live Peer Collaboration & Demo Day Premiere",
            "100-Point Rubric Mentor Evaluation",
            "Verified ATL & Kreomax Creator Credential"
        ],
        "popular": True,
        "cta": "Enroll in Creator Cohort"
    },
    {
        "id": "training-1on1-30h",
        "name": "1:1 Creator Mentorship",
        "badge": "Elite Track · Dedicated Mentor",
        "duration": "30 Hours Personalized",
        "schedule": "Flexible 1:1 Schedule (Weekdays / Weekends)",
        "price": 14999,
        "originalPrice": 24999,
        "currency": "INR",
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
        "cta": "Book 1:1 Creator Mentorship"
    }
]

PAYMENT_TRANSACTIONS = []
ADMISSION_APPLICATIONS = []

class AdmissionApplicationRequest(BaseModel):
    planId: str
    planName: Optional[str] = "Creator Cohort"
    studentName: str
    studentEmail: str
    studentPhone: str
    studentGrade: Optional[str] = "Grade 8-12"
    notes: Optional[str] = ""

@app.post("/api/admissions/apply")
async def submit_admission_application(req: AdmissionApplicationRequest):
    """
    Records student pre-registration / admission application.
    Saves lead to memory and disk, and returns a pre-filled WhatsApp link.
    """
    app_id = f"KMX-ADM-{int(time.time()) % 100000:05d}"
    record = {
        "applicationId": app_id,
        "planId": req.planId,
        "planName": req.planName,
        "studentName": req.studentName,
        "studentEmail": req.studentEmail,
        "studentPhone": req.studentPhone,
        "studentGrade": req.studentGrade,
        "notes": req.notes,
        "timestamp": int(time.time()),
        "status": "pending_consultation"
    }
    ADMISSION_APPLICATIONS.append(record)

    # Save to leads_data.json
    try:
        leads_path = os.path.join(os.path.dirname(__file__), "leads_data.json")
        with open(leads_path, "w", encoding="utf-8") as f:
            json.dump(ADMISSION_APPLICATIONS, f, indent=2)
    except Exception as e:
        print(f"[Lead Persistence Notice]: {e}")

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

@app.get("/api/admissions/list")
async def list_admission_applications():
    return {
        "status": "success",
        "count": len(ADMISSION_APPLICATIONS),
        "applications": ADMISSION_APPLICATIONS
    }

class CreateOrderRequest(BaseModel):
    planId: str
    amount: Optional[int] = None
    customerName: Optional[str] = "Student Creator"
    customerEmail: Optional[str] = "creator@kreomax.ai"
    customerPhone: Optional[str] = "9876543210"

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: Optional[str] = None
    planId: str
    customerEmail: Optional[str] = None
    customerName: Optional[str] = None

@app.get("/api/payment/config")
async def get_payment_config():
    """
    Returns Razorpay configuration and public API key.
    Never exposes the RAZORPAY_KEY_SECRET!
    """
    key_id = os.environ.get("RAZORPAY_KEY_ID", "").strip()
    return {
        "status": "success",
        "razorpayKeyId": key_id if key_id else "rzp_test_kreomax_sandbox",
        "currency": "INR",
        "isLiveKey": bool(key_id and key_id.startswith("rzp_live")),
        "isTestKey": bool(key_id and key_id.startswith("rzp_test")),
        "isConfigured": bool(key_id),
        "plans": PRICING_PLANS
    }

@app.post("/api/payment/create-order")
async def create_payment_order(req: CreateOrderRequest):
    """
    Creates a Razorpay Order ID.
    If RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET are set in .env, calls Razorpay's live/test REST API.
    If keys are absent, creates a simulated order so user testing works immediately without blockers.
    """
    plan = next((p for p in PRICING_PLANS if p["id"] == req.planId), PRICING_PLANS[1])
    amount_in_rupees = req.amount if req.amount else plan["price"]
    amount_in_paise = amount_in_rupees * 100

    key_id = os.environ.get("RAZORPAY_KEY_ID", "").strip()
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()

    receipt_id = f"rcpt_{int(time.time())}_{uuid.uuid4().hex[:4]}"

    # If valid Razorpay keys exist, call Razorpay Orders API
    if key_id and key_secret:
        try:
            url = "https://api.razorpay.com/v1/orders"
            payload = json.dumps({
                "amount": amount_in_paise,
                "currency": "INR",
                "receipt": receipt_id,
                "notes": {
                    "planId": plan["id"],
                    "planName": plan["name"],
                    "customerEmail": req.customerEmail or "creator@kreomax.ai"
                }
            }).encode("utf-8")

            auth_str = f"{key_id}:{key_secret}"
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            request = urllib.request.Request(url, data=payload, headers={
                "Content-Type": "application/json",
                "Authorization": f"Basic {auth_b64}"
            })

            with urllib.request.urlopen(request, timeout=10) as response:
                rzp_order = json.loads(response.read().decode("utf-8"))
                return {
                    "status": "success",
                    "orderId": rzp_order.get("id"),
                    "amount": rzp_order.get("amount"),
                    "currency": rzp_order.get("currency", "INR"),
                    "keyId": key_id,
                    "plan": plan,
                    "isSimulated": False
                }
        except Exception as e:
            print(f"[Razorpay API Error, falling back to sandbox]: {e}")
            # Fall through to sandbox fallback so app doesn't crash on invalid keys

    # Sandbox / Demo order generation
    mock_order_id = f"order_test_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    return {
        "status": "success",
        "orderId": mock_order_id,
        "amount": amount_in_paise,
        "currency": "INR",
        "keyId": key_id if key_id else "rzp_test_kreomax_sandbox",
        "plan": plan,
        "isSimulated": not (key_id and key_secret),
        "note": "Running in test sandbox mode. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for production payments."
    }

@app.post("/api/payment/verify")
async def verify_payment(req: VerifyPaymentRequest):
    """
    Verifies Razorpay payment signature using HMAC-SHA256.
    Unlocks full creator privileges upon successful verification.
    """
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()
    is_simulated = req.razorpay_order_id.startswith("order_test_") or not key_secret

    verified = False
    if is_simulated:
        verified = True
    else:
        if req.razorpay_signature:
            message = f"{req.razorpay_order_id}|{req.razorpay_payment_id}"
            generated_sign = hmac.new(
                key_secret.encode("utf-8"),
                message.encode("utf-8"),
                hashlib.sha256
            ).hexdigest()
            verified = hmac.compare_digest(generated_sign, req.razorpay_signature)

    if not verified:
        raise HTTPException(status_code=400, detail="Invalid payment signature verification failed.")

    tx_record = {
        "transactionId": req.razorpay_payment_id,
        "orderId": req.razorpay_order_id,
        "planId": req.planId,
        "customerEmail": req.customerEmail or LEARNER_PROFILE.get("email"),
        "customerName": req.customerName or LEARNER_PROFILE.get("name"),
        "timestamp": int(time.time()),
        "status": "paid",
        "isSimulated": is_simulated
    }
    PAYMENT_TRANSACTIONS.append(tx_record)

    # Upgrade learner profile
    LEARNER_PROFILE["enrolledPlan"] = req.planId
    LEARNER_PROFILE["enrolledAt"] = int(time.time())

    return {
        "status": "success",
        "verified": True,
        "transactionId": req.razorpay_payment_id,
        "orderId": req.razorpay_order_id,
        "planId": req.planId,
        "isSimulated": is_simulated,
        "message": f"Payment successfully verified! Plan '{req.planId}' is active."
    }

@app.get("/api/payment/transactions")
async def get_payment_transactions():
    """Returns recorded payment transactions."""
    return {
        "status": "success",
        "count": len(PAYMENT_TRANSACTIONS),
        "transactions": PAYMENT_TRANSACTIONS
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)


