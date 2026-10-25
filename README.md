# SecureGap

### ISO 27001 / GDPR Gap Assessment Tool

SecureGap is an educational cybersecurity application that helps users assess potential compliance gaps by mapping Vulnerability Assessment and Penetration Testing (VAPT) findings to relevant ISO 27001 controls and GDPR provisions.

It provides a centralized interface to manage security findings, review potential compliance gaps, and track remediation progress.

## Features

- Create, view, and update VAPT findings.
- Associate findings with compliance controls.
- Identify potential compliance gaps.
- Track finding and remediation statuses.
- View dashboard statistics.
- Export assessment data as CSV.
- Use a web-based interface to manage assessments.

## Technology Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- SQLite

**Frontend**
- React
- TypeScript
- Vite
- npm

## Project Structure

```text
SecureGap/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── ...
├── frontend/
│   ├── src/
│   ├── package.json
│   ├── .gitignore
│   └── ...
└── README.md
```

The exact files may vary depending on your project version.

## Prerequisites

Install the following before setting up the project:

- **Python 3.10 or newer** (use a version compatible with your backend dependencies).
- **Node.js and npm** (use a current LTS version).
- **Git**, to clone the repository.

Verify your installations:

```bash
python --version
node --version
npm --version
git --version
```

On some Windows systems, use `py --version` if the `python` command is unavailable.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Prachisingh38/SecureGap.git
cd SecureGap
```

### 2. Set up the backend

Open a terminal in the `backend` directory:

```bash
cd backend
```

Create a virtual environment:

**Windows PowerShell**

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

If PowerShell blocks activation, you can use Command Prompt instead:

```bat
venv\Scripts\activate.bat
```

**macOS / Linux**

```bash
python3 -m venv venv
source venv/bin/activate
```

Install the Python dependencies:

```bash
python -m pip install --upgrade pip
pip install -r requirements.txt
```

If the project requires environment variables, create a `.env` file using the variables documented by the project. Never commit credentials or API keys.

### 3. Initialize the database

SecureGap uses SQLite. The database is created or initialized according to the backend's database setup.

If the application creates its tables automatically during startup, no manual database setup is required. Otherwise, follow the database initialization instructions provided in the backend code.

Do not commit a database containing sensitive or real assessment data.

### 4. Start the backend API

From the `backend` directory, with the virtual environment activated, run:

```bash
uvicorn app.main:app --reload
```

The API should be available at:

- API base URL: http://127.0.0.1:8000
- Interactive API documentation: http://127.0.0.1:8000/docs

Keep this terminal running while using the frontend.

### 5. Set up the frontend

Open a **second terminal** and navigate to the frontend directory from the project root:

```bash
cd frontend
```

Install the dependencies:

```bash
npm install
```

#### Configure the API URL

If the frontend supports the `VITE_API_BASE_URL` environment variable, create a `.env` file inside `frontend/`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Make sure this variable name matches the one used in the frontend API client. Do not add secrets to frontend environment variables; Vite exposes `VITE_` variables to browser code.

#### Start the frontend

```bash
npm run dev
```

Open the local URL printed by Vite in the terminal, commonly:

http://localhost:5173

Keep both the backend and frontend terminals running.

## Verify the Installation

1. Open the frontend in your browser.
2. Confirm that the dashboard loads.
3. Create a sample security finding.
4. Confirm that the finding appears in the findings list.
5. Refresh the page and verify that the finding persists.
6. Test compliance mapping, remediation tracking, and CSV export if those features are configured.
7. If the frontend cannot connect to the backend, verify the API URL and check the backend terminal for errors.

## Troubleshooting

**Backend dependencies fail to install**
- Check your Python version.
- Ensure that the virtual environment is activated.
- Review the error message and the dependencies listed in `backend/requirements.txt`.

**Frontend dependencies fail to install**
- Check your Node.js and npm versions.
- Run `npm install` from the `frontend` directory.

**Frontend cannot reach the API**
- Confirm that the backend is running at `http://127.0.0.1:8000`.
- Verify `VITE_API_BASE_URL`.
- Check whether the backend's CORS configuration permits the frontend's local origin.
- Restart the Vite development server after changing environment variables.

**Findings are not saved**
- Check the backend logs and API response.
- Verify that the configured SQLite database is the expected database file.
- Check for request validation errors in the browser's developer tools and the API documentation.

## Disclaimer

SecureGap is an educational prototype intended for learning and demonstration purposes. Its compliance mappings are preliminary and should not be treated as legal advice, a formal security assessment, or proof of ISO 27001 or GDPR compliance.

Always validate findings and control mappings against the applicable standards, regulations, organizational requirements, and advice from qualified professionals.

## License

No license has been specified yet. Add a `LICENSE` file if you intend to distribute the project under an open-source license.
