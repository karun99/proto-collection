import os
import json
import math
import requests
import io
from fastapi import FastAPI, Request, Form, File, UploadFile, HTTPException
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn

# Pydroid 3 specific library handling
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

app = FastAPI()
templates = Jinja2Templates(directory="templates")

def extract_text_from_bytes(file_bytes, filename):
    ext = os.path.splitext(filename)[1].lower()
    text = ""
    try:
        if ext == ".txt":
            text = file_bytes.decode('utf-8', errors='ignore')
        elif ext == ".pdf":
            if PyPDF2:
                reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    text += (page.extract_text() or "") + " "
            else:
                return "Error: PyPDF2 not installed"
        elif ext == ".docx":
            if docx:
                doc = docx.Document(io.BytesIO(file_bytes))
                text = " ".join([para.text for para in doc.paragraphs])
            else:
                return "Error: python-docx not installed"
        return text.lower()
    except Exception as e:
        return f"Error reading file: {str(e)}"

@app.get("/", response_class=HTMLResponse)
async def read_item(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/api/aggregate")
async def aggregate_jobs(
    role: str = Form(...),
    location: str = Form("Remote"),
    skills: str = Form(""),
    resume: UploadFile = File(None)
):
    try:
        skill_list = [s.strip().lower() for s in skills.split(",") if s.strip()]
        
        # Parse resume if provided
        resume_text = ""
        if resume and resume.filename:
            file_bytes = await resume.read()
            resume_text = extract_text_from_bytes(file_bytes, resume.filename)
            if resume_text.startswith("Error"):
                raise HTTPException(status_code=400, detail=resume_text)

        all_jobs = []

        # 1. Fetch from Remotive
        remotive_url = f"https://remotive.com/api/remote-jobs?search={role}"
        try:
            res = requests.get(remotive_url, timeout=10)
            if res.status_code == 200:
                data = res.json()
                for j in data.get('jobs', []):
                    all_jobs.append({
                        "title": j.get('title'),
                        "company": j.get('company_name'),
                        "url": j.get('url'),
                        "location": j.get('candidate_required_location', 'Remote'),
                        "tags": [t.lower() for t in j.get('tags', [])],
                        "source": "Remotive"
                    })
        except Exception as e:
            print(f"Remotive error: {e}")

        # 2. Fetch from RemoteOK
        remoteok_url = f"https://remoteok.com/api?tag={role.replace(' ', '-').lower()}"
        try:
            res = requests.get(remoteok_url, timeout=10, headers={'User-Agent': 'PydroidJobAggregator/1.0'})
            if res.status_code == 200:
                data = res.json()
                for j in data:
                    if isinstance(j, dict) and 'slug' in j:
                        all_jobs.append({
                            "title": j.get('position'),
                            "company": j.get('company'),
                            "url": f"https://remoteok.com/remote-jobs/{j.get('slug')}",
                            "location": j.get('location', 'Remote'),
                            "tags": j.get('tags', []),
                            "source": "RemoteOK"
                        })
        except Exception as e:
            print(f"RemoteOK error: {e}")

        # 3. Filtering logic
        filtered_jobs = []
        for job in all_jobs:
            job_text = (job['title'] + " " + " ".join(job['tags'])).lower()
            
            # Check if any skills are mentioned (if provided)
            skill_match = True
            if skill_list:
                skill_match = any(skill in job_text for skill in skill_list)
            
            # Check location
            loc_match = location.lower() in job['location'].lower() if location else True
            
            if skill_match and loc_match:
                filtered_jobs.append(job)

        return {
            "search_criteria": {
                "role": role,
                "location": location,
                "skills": skill_list,
                "resume_provided": bool(resume_text)
            },
            "total_found": len(filtered_jobs),
            "jobs": filtered_jobs
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("Starting server at http://0.0.0.0:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
