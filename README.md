# DocAI — RAG-Powered Document Q&A Chatbot

A full-stack Retrieval-Augmented Generation (RAG) chatbot that lets you upload documents and ask questions about them. Built with FastAPI, React, ChromaDB, and Anthropic Claude.

---

## Features

- **Document Ingestion** — Upload PDF and DOCX files into a vector knowledge base
- **RAG Pipeline** — Retrieves the most relevant chunks before generating answers
- **Multi-session Chat** — Create, switch between, and delete multiple conversations
- **Document Filtering** — Ask questions scoped to a specific uploaded document
- **Day / Night Theme** — Toggle between dark (default) and light mode
- **Source Citations** — Every answer shows which document and page it came from
- **Admin Dashboard** — Password-protected portal to manage documents and view stats

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.13, FastAPI, Uvicorn |
| Vector Store | ChromaDB (persistent, local) |
| Embeddings | scikit-learn HashingVectorizer (offline, no download needed) |
| LLM | Anthropic Claude (claude-haiku) |
| Frontend | React 18, Vite, React Router |
| Styling | CSS custom properties, Netflix-inspired dark theme |

---

## Project Structure

```
DocAI — RAG-Chatbot/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Settings (loaded from .env)
│   ├── routers/
│   │   ├── chat.py              # Chat endpoints
│   │   ├── documents.py         # Upload / delete endpoints
│   │   └── auth.py              # Admin login
│   ├── ingestion/
│   │   ├── parser.py            # PDF & DOCX text extraction
│   │   └── chunker.py           # Recursive text splitter
│   ├── embeddings/
│   │   └── embedder.py          # HashingVectorizer embedder
│   ├── vectorstore/
│   │   └── chroma_store.py      # ChromaDB read/write
│   ├── retrieval/
│   │   └── retriever.py         # Similarity search
│   ├── llm/
│   │   └── groq_client.py       # Anthropic Claude client
│   ├── chat/
│   │   └── history_manager.py   # Session & message storage
│   └── models/
│       └── schemas.py           # Pydantic models
├── frontend1/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, ChatWindow, etc.
│   │   ├── pages/               # ChatPage, AdminPage
│   │   ├── services/api.js      # Axios API client
│   │   └── styles/global.css    # Theme & utility classes
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── data/                        # Auto-created at runtime (git-ignored)
├── requirements.txt
├── setup.bat
├── start.bat
└── .env.example
```

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher

### 1. Clone the repository

```bash
git clone https://github.com/YourUsername/rag-sourcing-agent.git
cd rag-sourcing-agent
```

### 2. Set up environment

```bash
copy .env.example .env
```

Open `.env` and fill in:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
ADMIN_PASSWORD=your_admin_password
```

Get a free Anthropic API key at: 

### 3. Install dependencies

**Option A — Use the setup script (Windows)**
```
setup.bat
```

**Option B — Manual**
```bash
# Python dependencies
pip install -r requirements.txt

# Node dependencies
cd frontend
npm install
cd ..
```

### 4. Run the application

**Option A — Use the start script (Windows)**
```
start.bat
```

**Option B — Manual (two terminals)**

Terminal 1 — Backend:
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

### 5. Open the app

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Main chat interface |
| `http://localhost:8000/docs` | FastAPI Swagger UI |

---

## Usage

1. **Upload documents** — Go to the Admin page, enter password (`admin123` by default), upload PDF or DOCX files
2. **Ask questions** — Return to Chat, type your question and press Enter
3. **Filter by document** — Use the sidebar "Filter by Doc" to scope answers to one file
4. **Switch themes** — Click the ☀ Day / 🌙 Night button in the top-right navbar
5. **Delete a chat** — Click the trash icon on any chat in the sidebar, confirm deletion

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check + stats |
| `POST` | `/api/documents/upload` | Upload documents |
| `GET` | `/api/documents/` | List all documents |
| `DELETE` | `/api/documents/{id}` | Delete a document |
| `POST` | `/api/chat/sessions` | Create a chat session |
| `GET` | `/api/chat/sessions` | List all sessions |
| `POST` | `/api/chat/message` | Send a message |
| `GET` | `/api/chat/sessions/{id}/messages` | Get session history |
| `DELETE` | `/api/chat/sessions/{id}` | Delete a session |
| `POST` | `/api/auth/login` | Admin login |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key from console.anthropic.com |
| `ADMIN_PASSWORD` | No | Admin portal password (default: `admin123`) |

---

## Notes

- **Corporate networks (Zscaler):** The app uses `api.anthropic.com` which is accessible through Zscaler. HuggingFace and Groq are blocked, so embeddings use a local `HashingVectorizer` (no internet required).
- **Data persistence:** All uploaded documents, vector embeddings, and chat history are stored locally in the `data/` folder and are git-ignored.

---

## Built for Cognizant Hackathon 2026
