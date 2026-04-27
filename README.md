# PhishGuard — Phishing Detection & Reporting System

PhishGuard is a comprehensive, full-stack application designed to detect and report phishing threats in real-time. By combining a modern web interface, a robust backend API, and a dedicated Machine Learning microservice, the system analyzes URLs, emails, and SMS messages for malicious intent.

## 🚀 Features

- **Real-Time Threat Analysis:** Submit URLs, emails, or messages for instant analysis.
- **Machine Learning Engine:** Dedicated Python microservice utilizing XGBoost and Scikit-Learn to accurately classify threats.
- **Threat Intelligence Integration:** Enriches scan results with data from external APIs like VirusTotal and Have I Been Pwned.
- **Interactive Dashboard:** View historical scan logs, data visualizations, and overall security posture.
- **Educational Module:** Dedicated phishing awareness module to educate users on recognizing common cyber threats.
- **Secure Authentication:** User authentication and session management to protect sensitive scan logs and personalize the user experience.
- **Containerized Deployment:** Fully Dockerized stack for seamless setup and environment consistency.

## 🛠️ Technology Stack

- **Frontend:** React.js, TailwindCSS, HTML5, CSS3, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Machine Learning:** Python, Flask, Scikit-Learn, XGBoost, Pandas, NumPy
- **Deployment:** Docker, Docker Compose

## 🏗️ Architecture Workflow

1. The user submits suspicious content via the **React Frontend**.
2. The **Node.js Backend** receives the payload and logs a preliminary `ScanLog` to **MongoDB**.
3. The backend forwards the content to the **Python ML Microservice** for deep predictive analysis.
4. The backend concurrently queries **Threat Intelligence APIs** (e.g., VirusTotal) for existing vulnerability reports.
5. All insights are consolidated, updated in the database, and returned to the user's dashboard.

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- [Python](https://www.python.org/) (v3.9+)
- [Docker & Docker Compose](https://www.docker.com/)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas, if running locally without Docker)

## 🐳 Quick Start (Docker - Recommended)

The easiest way to run the entire stack (Frontend, Backend, ML Service, and MongoDB) is using Docker Compose.

```bash
# Clone the repository
git clone <repository_url>
cd Project

# Build and start all services
docker compose up --build
```

Once started, the services will be available at:
- **Frontend UI:** `http://localhost:3000`
- **Backend API:** `http://localhost:5000`
- **ML Microservice:** `http://localhost:9000`

## 💻 Local Development Setup

If you prefer to run the services individually without Docker, follow these steps:

### 1. Backend Setup

```bash
cd server
npm install

# Setup environment variables
cp .env.example .env 
# Edit .env to include your local MONGO_URI and API keys

# Start the development server
npm run dev
```

### 2. Frontend Setup

```bash
cd client
npm install

# Start the React app
npm start
```

### 3. Machine Learning Service Setup

```bash
cd ml_service

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install required ML libraries
pip install -r requirements.txt

# Start the Flask ML API
python app.py
```
*(Ensure `ML_SERVICE_URL` is correctly pointed to `http://localhost:9000` in the backend's `.env` file).*

## 🔐 Environment Variables

To fully enable Threat Intelligence integrations, configure the following keys in `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/phishing_db
PORT=5000
ML_SERVICE_URL=http://localhost:9000

# Threat Intelligence APIs
VIRUSTOTAL_KEY=<your_virustotal_api_key>
HIBP_API_KEY=<your_hibp_api_key>
```
*Note: The backend gracefully handles missing keys, but will skip external API lookups.*

## 📚 API Endpoints

- `POST /api/scan`: Accepts `{ inputType, raw, userId }`. Analyzes the input using the ML service and Threat Intel APIs, then saves the consolidated result as a `ScanLog` in MongoDB.