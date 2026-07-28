import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import requests
import json
import threading
import os

# Pydroid 3 specific library handling
try:
    import PyPDF2
except ImportError:
    PyPDF2 = None

try:
    import docx
except ImportError:
    docx = None

class JobAggregator:
    def __init__(self, root):
        self.root = root
        self.root.title("Job Aggregator Pro")
        self.root.geometry("400x750")
        
        self.resume_path = tk.StringVar()
        self.resume_text = ""  # To store extracted text
        self.setup_ui()

    def setup_ui(self):
        # Header
        header = tk.Label(self.root, text="Job Content Aggregator", font=("Arial", 16, "bold"), pady=10)
        header.pack()

        main_frame = tk.Frame(self.root, padx=20, pady=10)
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Inputs
        tk.Label(main_frame, text="Job Role:").pack(anchor="w")
        self.role_entry = tk.Entry(main_frame, width=40)
        self.role_entry.pack(pady=5)
        self.role_entry.insert(0, "Python Developer")

        tk.Label(main_frame, text="Location:").pack(anchor="w")
        self.loc_entry = tk.Entry(main_frame, width=40)
        self.loc_entry.pack(pady=5)
        self.loc_entry.insert(0, "Remote")

        tk.Label(main_frame, text="Experience Level:").pack(anchor="w")
        self.exp_entry = tk.Entry(main_frame, width=40)
        self.exp_entry.pack(pady=5)
        self.exp_entry.insert(0, "Junior")

        tk.Label(main_frame, text="Skills (comma separated):").pack(anchor="w")
        self.skills_entry = tk.Entry(main_frame, width=40)
        self.skills_entry.pack(pady=5)
        self.skills_entry.insert(0, "Python, SQL, Flask")

        # Resume File Picker
        tk.Label(main_frame, text="Resume (PDF, DOCX, TXT):").pack(anchor="w", pady=(10, 0))
        resume_frame = tk.Frame(main_frame)
        resume_frame.pack(fill=tk.X)
        tk.Entry(resume_frame, textvariable=self.resume_path, state='readonly').pack(side=tk.LEFT, fill=tk.X, expand=True)
        tk.Button(resume_frame, text="Browse", command=self.browse_resume).pack(side=tk.RIGHT)

        # Progress bar
        self.progress = ttk.Progressbar(main_frame, mode='indeterminate')
        self.progress.pack(pady=20, fill=tk.X)

        # Buttons
        self.start_btn = tk.Button(main_frame, text="Fetch & Aggregate Jobs", bg="#4CAF50", fg="white", 
                                  height=2, font=("Arial", 12, "bold"), command=self.start_aggregation)
        self.start_btn.pack(fill=tk.X, pady=10)

        self.status_label = tk.Label(main_frame, text="Ready", fg="blue")
        self.status_label.pack()

    def browse_resume(self):
        filetypes = [
            ("All Supported", "*.pdf *.docx *.txt"),
            ("PDF files", "*.pdf"),
            ("Word documents", "*.docx"),
            ("Text files", "*.txt"),
            ("All files", "*.*")
        ]
        filename = filedialog.askopenfilename(filetypes=filetypes)
        if filename:
            self.resume_path.set(filename)
            self.extract_resume_text(filename)

    def extract_resume_text(self, filepath):
        ext = os.path.splitext(filepath)[1].lower()
        text = ""
        try:
            if ext == ".txt":
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    text = f.read()
            elif ext == ".pdf":
                if PyPDF2:
                    with open(filepath, 'rb') as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            text += (page.extract_text() or "") + " "
                else:
                    messagebox.showerror("Library Missing", "Please install PyPDF2 in Pydroid 3 (pip install PyPDF2)")
                    self.resume_path.set("")
            elif ext == ".docx":
                if docx:
                    doc = docx.Document(filepath)
                    text = " ".join([para.text for para in doc.paragraphs])
                else:
                    messagebox.showerror("Library Missing", "Please install python-docx in Pydroid 3 (pip install python-docx)")
                    self.resume_path.set("")
            
            self.resume_text = text.lower()
        except Exception as e:
            messagebox.showerror("Extraction Error", f"Could not read file: {e}")
            self.resume_path.set("")

    def start_aggregation(self):
        role = self.role_entry.get()
        if not role:
            messagebox.showwarning("Input Error", "Please enter a Job Role")
            return
        
        self.start_btn.config(state="disabled")
        self.progress.start()
        self.status_label.config(text="Fetching jobs... please wait", fg="orange")
        
        # Run in thread to avoid freezing UI
        thread = threading.Thread(target=self.run_aggregator)
        thread.start()

    def run_aggregator(self):
        try:
            role = self.role_entry.get()
            location = self.loc_entry.get()
            skills = [s.strip().lower() for s in self.skills_entry.get().split(",")]
            
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
                
                # Check if any skills are mentioned
                skill_match = any(skill in job_text for skill in skills)
                
                # Check location
                loc_match = location.lower() in job['location'].lower() if location else True
                
                if skill_match and loc_match:
                    filtered_jobs.append(job)

            # 4. Save to JSON
            output_file = "aggregated_jobs.json"
            result_data = {
                "search_criteria": {
                    "role": role,
                    "location": location,
                    "skills": skills,
                    "resume_file": self.resume_path.get()
                },
                "total_found": len(filtered_jobs),
                "jobs": filtered_jobs
            }
            
            with open(output_file, "w") as f:
                json.dump(result_data, f, indent=4)

            self.root.after(0, lambda: self.finish_aggregation(len(filtered_jobs), output_file))

        except Exception as e:
            self.root.after(0, lambda: messagebox.showerror("Process Error", str(e)))
            self.root.after(0, self.reset_ui)

    def finish_aggregation(self, count, file):
        self.progress.stop()
        self.start_btn.config(state="normal")
        self.status_label.config(text=f"Success! {count} jobs aggregated.", fg="green")
        messagebox.showinfo("Done", f"Found {count} jobs.\nResults saved to: {os.path.abspath(file)}")
        self.reset_ui()

    def reset_ui(self):
        self.progress.stop()
        self.start_btn.config(state="normal")

if __name__ == "__main__":
    root = tk.Tk()
    app = JobAggregator(root)
    root.mainloop()
