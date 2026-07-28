"""
Agent Runner: Lead Generation & Validation System - Dash Web App
-----------------------------------------------------------------
Dash-based application with:
- CSV file import/export
- OCR (EasyOCR) for image/PDF/DOCX text extraction
- Agent-based validation pipeline
- OpenRouter metadata enrichment
- Lead scoring and filtering
- Interactive data visualization
"""

import dash
from dash import dcc, html, Input, Output, State, callback_context, no_update
import dash_bootstrap_components as dbc
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import re
import json
import requests
import base64
import io
import os
import tempfile
import hashlib
from datetime import datetime
from urllib.parse import urlparse
import time
import threading

# OCR Libraries
try:
    import easyocr
    EASYOCR_AVAILABLE = True
except ImportError:
    EASYOCR_AVAILABLE = False

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import docx
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

# ============================================================
# CONFIGURATION
# ============================================================

DEFAULT_API_KEY = ""  # Set via environment variable OPENROUTER_API_KEY

# ============================================================
# DASH APP
# ============================================================

app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.DARKLY],
    meta_tags=[{"name": "viewport", "content": "width=device-width, initial-scale=1"}]
)
app.title = "Agent Runner - Lead Generation & Validation"
server = app.server

# ============================================================
# HELPER FUNCTIONS
# ============================================================

def init_ocr():
    """Initialize EasyOCR reader."""
    if not EASYOCR_AVAILABLE:
        return None
    try:
        reader = easyocr.Reader(['en'], gpu=False)
        return reader
    except Exception:
        return None

def extract_text_from_image(image_bytes):
    """Extract text from image bytes using EasyOCR."""
    reader = init_ocr()
    if reader is None:
        return "OCR engine not available. Install easyocr."
    try:
        import PIL.Image as Image
        import numpy as np
        image = Image.open(io.BytesIO(image_bytes))
        img_array = np.array(image)
        result = reader.readtext(img_array, detail=0)
        return "\n".join(result)
    except Exception as e:
        return f"OCR error: {str(e)}"

def extract_text_from_pdf(file_bytes):
    """Extract text from PDF bytes using PyMuPDF."""
    if not PYMUPDF_AVAILABLE:
        return "PyMuPDF not installed. Install with: pip install PyMuPDF"
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(file_bytes)
            tmp_path = tmp.name
        doc = fitz.open(tmp_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        os.unlink(tmp_path)
        return text
    except Exception as e:
        return f"PDF extraction error: {str(e)}"

def extract_text_from_docx(file_bytes):
    """Extract text from DOCX bytes."""
    if not DOCX_AVAILABLE:
        return "python-docx not installed. Install with: pip install python-docx"
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    except Exception as e:
        return f"DOCX extraction error: {str(e)}"

def parse_extracted_text(text):
    """Parse extracted text into lead fields."""
    lead = {}
    # Email
    email_match = re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
    if email_match:
        lead['email'] = email_match.group()
    # Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
    if phone_match:
        lead['phone'] = phone_match.group()
    # Name
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if len(line) > 5 and len(line) < 40:
            words = line.split()
            if len(words) >= 2 and all(w[0].isupper() for w in words[:2]):
                lead['first_name'] = words[0]
                lead['last_name'] = ' '.join(words[1:])
                break
    # Company
    company_patterns = [
        r'Company:?\s*([^\n]+)',
        r'Organization:?\s*([^\n]+)',
        r'([A-Z][a-zA-Z0-9\s]+(?:Inc|LLC|Ltd|Corp|Corporation|Company))'
    ]
    for pattern in company_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            lead['company'] = match.group(1).strip()
            break
    # Job Title
    title_patterns = [
        r'Title:?\s*([^\n]+)',
        r'Position:?\s*([^\n]+)',
        r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Manager|Director|Engineer|Analyst|Consultant|Developer|Designer|Architect|Lead|Head|VP|CEO|CTO|CFO|COO|President|Founder|Partner|Associate|Specialist))'
    ]
    for pattern in title_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            lead['job_title'] = match.group(1).strip()
            break
    # LinkedIn
    linkedin_match = re.search(r'(https?://(?:www\.)?linkedin\.com/[^\s]+)', text)
    if linkedin_match:
        lead['linkedin_url'] = linkedin_match.group()
    # Website
    website_match = re.search(r'(https?://(?:www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)', text)
    if website_match and 'linkedin.com' not in website_match.group():
        lead['company_website'] = website_match.group()
    return lead

# ============================================================
# AGENT PIPELINE
# ============================================================

def run_agent_pipeline(lead_data, api_key, min_score=60):
    """Run the agent pipeline on a single lead."""
    lead = lead_data.copy()
    errors = []
    validation_agents = []
    
    # 1. Email Validation
    email = lead.get('email', '').strip()
    if email:
        email = email.lower()
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(pattern, email):
            errors.append(f"Invalid email format: {email}")
        else:
            local, domain = email.split('@')
            disposable = {'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'temp-mail.org', 'yopmail.com'}
            if domain in disposable:
                errors.append(f"Disposable email domain: {domain}")
            else:
                lead['email'] = email
                validation_agents.append('Email Validator')
    else:
        errors.append("Email is required")
    
    # 2. Phone Validation
    phone = lead.get('phone', '').strip()
    if phone:
        cleaned = re.sub(r'[^\d+]', '', phone)
        if 7 <= len(cleaned) <= 15:
            if cleaned.startswith('+1'):
                formatted = f"+1 {cleaned[2:4]} {cleaned[4:7]} {cleaned[7:11]}"
            elif len(cleaned) == 10:
                formatted = f"({cleaned[0:3]}) {cleaned[3:6]}-{cleaned[6:10]}"
            else:
                formatted = cleaned
            lead['phone'] = formatted
            validation_agents.append('Phone Validator')
        else:
            errors.append(f"Invalid phone length: {phone}")
    
    # 3. Domain Validation
    url = lead.get('company_website', '').strip()
    if not url and email:
        domain = email.split('@')[-1]
        url = f"https://{domain}"
        lead['company_website'] = url
    if url:
        if not url.startswith(('http://', 'https://')):
            url = f"https://{url}"
        try:
            parsed = urlparse(url)
            domain_name = parsed.netloc or parsed.path
            if domain_name:
                pattern = r'^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$'
                if re.match(pattern, domain_name):
                    lead['company_website'] = url
                    validation_agents.append('Domain Validator')
                else:
                    errors.append(f"Invalid domain: {domain_name}")
        except Exception:
            errors.append("Invalid URL format")
    
    # 4. AI Enrichment (if API key provided)
    if api_key and api_key != "":
        enriched = enrich_with_openrouter(lead, api_key)
        if enriched:
            for field, value in enriched.items():
                if value and not lead.get(field):
                    lead[field] = value
                    lead['enriched_fields'] = lead.get('enriched_fields', []) + [field]
            lead['enrichment_source'] = 'openrouter'
            validation_agents.append('AI Enricher')
    
    # 5. Completeness Scoring
    weights = {
        'email': 25,
        'first_name': 15,
        'last_name': 15,
        'company': 15,
        'job_title': 10,
        'phone': 10,
        'company_website': 5,
        'linkedin_url': 5
    }
    completeness = 0
    for field, weight in weights.items():
        if lead.get(field):
            completeness += weight
    lead['completeness_score'] = min(completeness, 100)
    
    # Validation score
    val_score = 0
    if lead.get('email'):
        val_score += 30
    if lead.get('first_name') and lead.get('last_name'):
        val_score += 25
    elif lead.get('first_name') or lead.get('last_name'):
        val_score += 15
    if lead.get('company'):
        val_score += 20
    if lead.get('job_title'):
        val_score += 15
    if lead.get('phone'):
        val_score += 10
    lead['validation_score'] = min(val_score, 100)
    
    # Final validity
    lead['is_valid'] = (
        lead.get('completeness_score', 0) >= min_score and
        len(errors) <= 2 and
        lead.get('email') is not None
    )
    lead['validation_agents'] = validation_agents
    lead['errors'] = errors
    lead['agent_chain'] = validation_agents
    lead['lead_id'] = hashlib.md5(f"{lead.get('email', '')}{lead.get('company', '')}".encode()).hexdigest()[:12]
    lead['processed_at'] = datetime.now().isoformat()
    
    return lead

def enrich_with_openrouter(lead, api_key):
    """Use OpenRouter to enrich lead metadata."""
    try:
        company = lead.get('company', '')
        email_domain = lead.get('email', '').split('@')[-1] if lead.get('email') else ''
        name = f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip()
        
        prompt = f"""
        Given this lead information, provide metadata in JSON:
        Name: {name}
        Company: {company}
        Email: {lead.get('email', '')}
        
        Return JSON with these fields (use null if unknown):
        {{
            "industry": "industry sector",
            "company_size": "employee count range",
            "location": "city, state, country",
            "job_title": "standardized job title"
        }}
        Be conservative. Only provide information you are confident about.
        """
        
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://agent-runner.dash-app.com"
            },
            json={
                "model": "google/gemini-2.0-flash-001",
                "messages": [
                    {"role": "system", "content": "You are a business intelligence agent. Return ONLY valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,
                "max_tokens": 200
            },
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            json_match = re.search(r'\{[^{}]*\}', content, re.DOTALL)
            if json_match:
                enriched = json.loads(json_match.group())
                return enriched
    except Exception:
        pass
    return {}

def process_batch(leads, api_key, min_score):
    """Process a batch of leads."""
    processed = []
    for lead in leads:
        processed.append(run_agent_pipeline(lead, api_key, min_score))
    return processed

# ============================================================
# APP LAYOUT
# ============================================================

app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.H1("🧠 Agent Runner", className="text-center my-4"), width=12)
    ]),
    dbc.Row([
        dbc.Col(html.H5("Lead Generation & Validation System", className="text-center text-muted mb-4"), width=12)
    ]),
    
    dbc.Row([
        # Sidebar
        dbc.Col([
            dbc.Card([
                dbc.CardHeader("⚙️ Configuration", className="bg-dark"),
                dbc.CardBody([
                    html.Label("OpenRouter API Key"),
                    dbc.Input(
                        id="api-key-input",
                        type="password",
                        value=DEFAULT_API_KEY,
                        placeholder="Enter your API key",
                        className="mb-3"
                    ),
                    html.Label("Minimum Completeness Score"),
                    dcc.Slider(
                        id="min-score-slider",
                        min=0,
                        max=100,
                        step=5,
                        value=60,
                        marks={i: str(i) for i in range(0, 101, 20)},
                        className="mb-3"
                    ),
                    html.Hr(),
                    html.H6("📤 Upload Data", className="mt-2"),
                    dcc.Upload(
                        id="upload-data",
                        children=html.Div([
                            "Drag and Drop or ",
                            html.A("Select Files", className="text-primary")
                        ]),
                        style={
                            "width": "100%",
                            "height": "80px",
                            "lineHeight": "80px",
                            "borderWidth": "2px",
                            "borderStyle": "dashed",
                            "borderRadius": "10px",
                            "textAlign": "center",
                            "margin": "10px 0",
                            "borderColor": "#6c8cff",
                            "color": "#c0c0d0"
                        },
                        multiple=False,
                        accept=".csv,.png,.jpg,.jpeg,.pdf,.docx"
                    ),
                    html.Div(id="upload-status", className="text-center text-muted mb-2"),
                    
                    html.Hr(),
                    html.H6("🚀 Actions", className="mt-2"),
                    dbc.Button(
                        "▶ Process All Leads",
                        id="process-btn",
                        color="primary",
                        className="w-100 mb-2",
                        disabled=False
                    ),
                    dbc.Button(
                        "📥 Export Results",
                        id="export-btn",
                        color="success",
                        className="w-100 mb-2",
                        disabled=False
                    ),
                    dbc.Button(
                        "🗑️ Clear All",
                        id="clear-btn",
                        color="danger",
                        className="w-100",
                        disabled=False
                    ),
                ])
            ], className="mb-4 shadow", style={"border": "1px solid rgba(255,255,255,0.1)"}),
        ], width=3),
        
        # Main content
        dbc.Col([
            dbc.Tabs([
                dbc.Tab(label="📊 Data", tab_id="tab-data", children=[
                    dbc.Row([
                        dbc.Col(dbc.Card([
                            dbc.CardBody([
                                html.H6("Total", className="text-muted text-center"),
                                html.H3(id="total-leads", className="text-center")
                            ])
                        ], className="text-center"), width=3),
                        dbc.Col(dbc.Card([
                            dbc.CardBody([
                                html.H6("Valid", className="text-muted text-center"),
                                html.H3(id="valid-leads", className="text-center", style={"color": "#4ade80"})
                            ])
                        ], className="text-center"), width=3),
                        dbc.Col(dbc.Card([
                            dbc.CardBody([
                                html.H6("Invalid", className="text-muted text-center"),
                                html.H3(id="invalid-leads", className="text-center", style={"color": "#f87171"})
                            ])
                        ], className="text-center"), width=3),
                        dbc.Col(dbc.Card([
                            dbc.CardBody([
                                html.H6("Avg Score", className="text-muted text-center"),
                                html.H3(id="avg-score", className="text-center")
                            ])
                        ], className="text-center"), width=3),
                    ], className="mb-3"),
                    dbc.Card([
                        dbc.CardBody([
                            html.Div(id="data-table-container")
                        ])
                    ])
                ]),
                dbc.Tab(label="✅ Validation Results", tab_id="tab-validation", children=[
                    dbc.Card([
                        dbc.CardBody([
                            dbc.RadioItems(
                                id="filter-radio",
                                options=[
                                    {"label": "All", "value": "all"},
                                    {"label": "Valid Only", "value": "valid"},
                                    {"label": "Invalid Only", "value": "invalid"}
                                ],
                                value="all",
                                inline=True,
                                className="mb-3"
                            ),
                            html.Div(id="validation-table-container"),
                            html.Hr(),
                            html.H5("Lead Details", className="mt-3"),
                            dcc.Dropdown(id="lead-selector", placeholder="Select a lead to inspect", className="mb-2"),
                            html.Div(id="lead-detail-container")
                        ])
                    ])
                ]),
                dbc.Tab(label="🔍 Extracted Data", tab_id="tab-ocr", children=[
                    dbc.Card([
                        dbc.CardBody([
                            html.H5("Extracted Text from OCR", className="mb-2"),
                            dbc.Textarea(id="extracted-text", style={"height": "200px", "width": "100%"}),
                            dbc.Button("Parse Extracted Text into Lead", id="parse-btn", color="primary", className="mt-2"),
                            html.Div(id="parse-status", className="mt-2")
                        ])
                    ])
                ]),
                dbc.Tab(label="📈 Analytics", tab_id="tab-analytics", children=[
                    dbc.Card([
                        dbc.CardBody([
                            dcc.Graph(id="histogram-chart"),
                            dcc.Graph(id="pie-chart"),
                            dcc.Graph(id="scatter-chart")
                        ])
                    ])
                ]),
            ], id="tabs", active_tab="tab-data", className="mb-3")
        ], width=9)
    ]),
    
    # Hidden divs for storing data
    dcc.Store(id="leads-store", data=[]),
    dcc.Store(id="processed-store", data=[]),
    dcc.Store(id="extracted-text-store", data=""),
    dcc.Store(id="export-data-store", data=""),
    
    html.Div(id="dummy-output", style={"display": "none"})
], fluid=True, className="bg-dark text-light min-vh-100", style={"padding": "20px"})

# ============================================================
# CALLBACKS
# ============================================================

@app.callback(
    Output("upload-status", "children"),
    Output("leads-store", "data"),
    Output("extracted-text-store", "data"),
    Input("upload-data", "contents"),
    State("upload-data", "filename"),
    prevent_initial_call=True
)
def handle_upload(contents, filename):
    if contents is None:
        return no_update, no_update, no_update
    
    content_type, content_string = contents.split(",")
    decoded = base64.b64decode(content_string)
    
    # Determine file type
    if filename.endswith('.csv'):
        try:
            df = pd.read_csv(io.StringIO(decoded.decode('utf-8')))
            leads = df.to_dict('records')
            return f"Loaded {len(leads)} leads from CSV", leads, no_update
        except Exception as e:
            return f"Error reading CSV: {str(e)}", no_update, no_update
    elif filename.endswith(('.png', '.jpg', '.jpeg')):
        # OCR
        text = extract_text_from_image(decoded)
        if text.startswith("OCR error") or text.startswith("OCR engine not available"):
            return text, no_update, no_update
        return "OCR complete! See Extracted Data tab.", no_update, text
    elif filename.endswith('.pdf'):
        text = extract_text_from_pdf(decoded)
        if text.startswith("PyMuPDF not installed") or text.startswith("PDF extraction error"):
            return text, no_update, no_update
        return "PDF text extracted! See Extracted Data tab.", no_update, text
    elif filename.endswith('.docx'):
        text = extract_text_from_docx(decoded)
        if text.startswith("python-docx not installed") or text.startswith("DOCX extraction error"):
            return text, no_update, no_update
        return "DOCX text extracted! See Extracted Data tab.", no_update, text
    else:
        return "Unsupported file type.", no_update, no_update

@app.callback(
    Output("extracted-text", "value"),
    Input("extracted-text-store", "data")
)
def update_extracted_text(data):
    return data if data else ""

@app.callback(
    Output("parse-status", "children"),
    Output("leads-store", "data", allow_duplicate=True),
    Input("parse-btn", "n_clicks"),
    State("extracted-text-store", "data"),
    State("leads-store", "data"),
    prevent_initial_call=True
)
def parse_extracted(n_clicks, text, current_leads):
    if n_clicks is None or not text:
        return "No text to parse.", no_update
    parsed = parse_extracted_text(text)
    if not parsed:
        return "Could not parse any lead fields.", no_update
    # Append to leads
    current_leads.append(parsed)
    return f"Parsed lead: {parsed.get('email', 'No email')}", current_leads

@app.callback(
    Output("processed-store", "data"),
    Output("process-btn", "disabled"),
    Input("process-btn", "n_clicks"),
    State("leads-store", "data"),
    State("api-key-input", "value"),
    State("min-score-slider", "value"),
    prevent_initial_call=True
)
def process_leads(n_clicks, leads, api_key, min_score):
    if n_clicks is None or not leads:
        return no_update, no_update
    if not api_key or api_key.strip() == "":
        # Process without enrichment
        pass
    processed = process_batch(leads, api_key, min_score)
    return processed, False

@app.callback(
    Output("export-data-store", "data"),
    Input("export-btn", "n_clicks"),
    State("processed-store", "data"),
    prevent_initial_call=True
)
def export_data(n_clicks, processed):
    if n_clicks is None or not processed:
        return no_update
    df = pd.DataFrame(processed)
    csv = df.to_csv(index=False)
    return csv

@app.callback(
    Output("dummy-output", "children"),
    Input("export-data-store", "data"),
    prevent_initial_call=True
)
def download_export(csv_data):
    if csv_data:
        # Create a download link using a data URI
        import base64
        b64 = base64.b64encode(csv_data.encode()).decode()
        href = f'<a href="data:file/csv;base64,{b64}" download="processed_leads.csv">Download CSV</a>'
        # We'll display this in a modal or via dcc.Download? Better to use dcc.Download component.
        # Since dcc.Download is not available in this version, we'll use a simple approach.
        # We'll create a hidden div with the link and auto-click it.
        # We'll use JavaScript to trigger download.
        # For simplicity, we'll show a message and let user click.
        # We'll store in a hidden div and use a callback to generate download.
        # Let's use the approach: create a data URI and open in new tab.
        # We'll just return a message.
        return html.Div([
            html.A("Download CSV", href=f"data:file/csv;base64,{b64}", download="processed_leads.csv", target="_blank", className="btn btn-success")
        ])
    return no_update

@app.callback(
    Output("clear-btn", "n_clicks"),
    Input("clear-btn", "n_clicks"),
    prevent_initial_call=True
)
def clear_data(n_clicks):
    if n_clicks:
        # We need to clear stores but can't from callback output directly without resetting.
        # We'll use a combined callback.
        pass
    return no_update

@app.callback(
    Output("leads-store", "data", allow_duplicate=True),
    Output("processed-store", "data", allow_duplicate=True),
    Output("extracted-text-store", "data", allow_duplicate=True),
    Input("clear-btn", "n_clicks"),
    prevent_initial_call=True
)
def clear_all(n_clicks):
    if n_clicks:
        return [], [], ""
    return no_update, no_update, no_update

# Update metrics and tables
@app.callback(
    Output("total-leads", "children"),
    Output("valid-leads", "children"),
    Output("invalid-leads", "children"),
    Output("avg-score", "children"),
    Input("processed-store", "data"),
    Input("leads-store", "data")
)
def update_metrics(processed, leads):
    if processed:
        total = len(processed)
        valid = sum(1 for l in processed if l.get('is_valid', False))
        invalid = total - valid
        avg = sum(l.get('completeness_score', 0) for l in processed) / total if total > 0 else 0
        return f"{total}", f"{valid}", f"{invalid}", f"{avg:.1f}"
    elif leads:
        total = len(leads)
        return f"{total}", "0", "0", "-"
    else:
        return "0", "0", "0", "-"

@app.callback(
    Output("data-table-container", "children"),
    Input("processed-store", "data"),
    Input("leads-store", "data")
)
def update_data_table(processed, leads):
    if processed:
        df = pd.DataFrame(processed)
        display_cols = ['email', 'first_name', 'last_name', 'company', 'job_title', 'completeness_score', 'validation_score', 'is_valid']
        # Keep only existing columns
        cols = [c for c in display_cols if c in df.columns]
        df_display = df[cols]
        # Convert boolean to string
        if 'is_valid' in df_display.columns:
            df_display['is_valid'] = df_display['is_valid'].map({True: '✅', False: '❌'})
        return dbc.Table.from_dataframe(df_display, striped=True, bordered=True, hover=True, dark=True, className="mt-2")
    elif leads:
        df = pd.DataFrame(leads)
        return dbc.Table.from_dataframe(df, striped=True, bordered=True, hover=True, dark=True, className="mt-2")
    else:
        return html.Div("No data loaded.", className="text-muted text-center")

@app.callback(
    Output("validation-table-container", "children"),
    Output("lead-selector", "options"),
    Input("processed-store", "data"),
    Input("filter-radio", "value")
)
def update_validation_table(processed, filter_value):
    if not processed:
        return html.Div("No processed leads.", className="text-muted text-center"), []
    
    df = pd.DataFrame(processed)
    if filter_value == "valid":
        df = df[df['is_valid'] == True]
    elif filter_value == "invalid":
        df = df[df['is_valid'] == False]
    
    if df.empty:
        return html.Div("No leads match filter.", className="text-muted text-center"), []
    
    # Prepare table
    display_cols = ['lead_id', 'email', 'first_name', 'last_name', 'company', 'job_title', 'completeness_score', 'validation_score', 'is_valid']
    cols = [c for c in display_cols if c in df.columns]
    df_display = df[cols]
    if 'is_valid' in df_display.columns:
        df_display['is_valid'] = df_display['is_valid'].map({True: '✅', False: '❌'})
    table = dbc.Table.from_dataframe(df_display, striped=True, bordered=True, hover=True, dark=True, className="mt-2")
    
    # Dropdown options
    options = [{"label": f"{row['email']} ({row.get('company', 'N/A')})", "value": idx} for idx, row in df.iterrows()]
    return table, options

@app.callback(
    Output("lead-detail-container", "children"),
    Input("lead-selector", "value"),
    State("processed-store", "data")
)
def show_lead_detail(idx, processed):
    if idx is None or not processed or idx >= len(processed):
        return html.Div("Select a lead to view details.", className="text-muted")
    lead = processed[idx]
    # Format as JSON
    detail = json.dumps(lead, indent=2)
    return dbc.Textarea(value=detail, style={"height": "200px", "width": "100%"}, className="bg-dark text-light")

# Analytics charts
@app.callback(
    Output("histogram-chart", "figure"),
    Output("pie-chart", "figure"),
    Output("scatter-chart", "figure"),
    Input("processed-store", "data")
)
def update_charts(processed):
    if not processed:
        # Return empty figures
        return go.Figure(), go.Figure(), go.Figure()
    
    df = pd.DataFrame(processed)
    
    # Histogram
    fig1 = px.histogram(df, x='completeness_score', nbins=20, title="Completeness Score Distribution",
                        color_discrete_sequence=['#6c8cff'])
    fig1.update_layout(template="plotly_dark")
    
    # Pie
    valid_counts = df['is_valid'].value_counts().reset_index()
    valid_counts.columns = ['Valid', 'Count']
    valid_counts['Valid'] = valid_counts['Valid'].map({True: 'Valid', False: 'Invalid'})
    fig2 = px.pie(valid_counts, values='Count', names='Valid', title="Lead Validity Breakdown",
                  color_discrete_sequence=['#4ade80', '#f87171'])
    fig2.update_layout(template="plotly_dark")
    
    # Scatter
    fig3 = px.scatter(df, x='completeness_score', y='validation_score', color='is_valid',
                      title="Validation Score vs Completeness",
                      color_discrete_map={True: '#4ade80', False: '#f87171'})
    fig3.update_layout(template="plotly_dark")
    
    return fig1, fig2, fig3

# ============================================================
# RUN THE APP
# ============================================================

if __name__ == "__main__":
    app.run_server(debug=True, host='0.0.0.0', port=8050)