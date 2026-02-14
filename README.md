# AI for Developers - UI Lab

A full-stack AI-powered chat application demonstrating modern LLM integration, agentic AI patterns, and retrieval-augmented generation (RAG). This project combines a Next.js frontend with a FastAPI backend to create an intelligent assistant with document search capabilities and custom tools.

## 🎯 What You'll Learn

This repository demonstrates:
- Building conversational AI interfaces with streaming responses
- Implementing RAG (Retrieval-Augmented Generation) for knowledge-enhanced AI
- Creating AI agents with custom tools and function calling
- Integrating speech recognition and synthesis (Web Speech API)
- Managing state and context in modern React applications
- Designing scalable backend architectures with FastAPI and LangChain

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Frontend Deep Dive](#frontend-deep-dive)
5. [Backend Deep Dive](#backend-deep-dive)
6. [RAG System Explained](#rag-system-explained)
7. [Agent System Explained](#agent-system-explained)
8. [Advanced Topics](#advanced-topics)
9. [Development Workflow](#development-workflow)

---

## 🏗️ Project Overview

### What Does This Application Do?

This is an intelligent chat assistant that can:
- **Have natural conversations** using large language models (LLMs)
- **Search through documents** to answer questions based on uploaded knowledge
- **Perform calculations** using built-in tools
- **Speak responses** using text-to-speech
- **Listen to voice input** using speech recognition
- **Remember conversation history** for contextual responses

### Tech Stack

**Frontend:**
- Next.js 16 (React 19) - Modern React framework with app router
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first styling
- React Context API - State management
- Web Speech API - Browser-native speech capabilities

**Backend:**
- Python 3.x with FastAPI - High-performance async web framework
- LangChain - Framework for LLM applications
- LangServe - Deploy LangChain runnables as REST APIs
- OpenAI/OpenRouter - LLM providers
- Vector Databases - FAISS, Chroma, or Pinecone for document storage

---

## 🏛️ Architecture

### High-Level Overview

```
┌──────────────────────────────────────────────────────────┐
│                         FRONTEND                         │
│                     (Next.js + React)                    │
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │   Header   │  │ MessageList │  │  ChatInput       │   │
│  └────────────┘  └─────────────┘  └──────────────────┘   │
│                                                          │
│  ┌──────────────────────┐  ┌───────────────────────┐     │
│  │  Speech Synthesis    │  │  Speech Recognition   │     │
│  │  Modal               │  │  Modal                │     │
│  └──────────────────────┘  └───────────────────────┘     │
│                                                          │
│         Context: Messages, Settings, Status              │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP/JSON
                       ↓
┌──────────────────────────────────────────────────────────┐
│                    API ROUTE (Next.js)                   │
│                   /api/chat/route.ts                     │
│              (Formats requests for backend)              │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTP POST
                       ↓
┌──────────────────────────────────────────────────────────┐
│                        BACKEND                           │
│                   (FastAPI + LangChain)                  │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │                    FastAPI Server                  │  │
│  │                                                    │  │
│  │   POST /agent/invoke  ─┐                           │  │
│  │   POST /rag/invoke    ─┼─ LangServe Routes         │  │
│  │   GET  /              ─┘                           │  │
│  └────────┬────────────────────────┬──────────────────┘  │
│           │                        │                     │
│        ┌──▼────────┐        ┌──────▼─────────┐           │
│        │   AGENT   │        │   RAG CHAIN    │           │
│        │           │        │                │           │
│        │  • LLM    │        │  • Retriever   │           │
│        │  • Tools  │        │  • LLM         │           │
│        │  • Prompt │        │  • Prompt      │           │
│        └──┬────────┘        └──────┬─────────┘           │
│           │                        │                     │
│           │                   ┌────▼────────────────┐    │
│           │                   │  Vector Store       │    │
│           │                   │  (FAISS/Chroma)     │    │
│           │                   │  + BM25 Retriever   │    │
│           │                   └────┬────────────────┘    │
│           │                        │                     │
│           │                   ┌────▼────────────────┐    │
│           │                   │  Documents          │    │
│           │                   │  (PDFs, TXT, CSV)   │    │
│           │                   └────────────────┬────┘    │
│           │                                    │         │
│      ┌────▼──────────────┐                     │         │
│      │  TOOLS            │                     │         │
│      │  • calculator     │                     │         │
│      │  • search_notes   │◄────────────────────┘         │
│      └───────────────────┘   (Tools can query RAG)       │
│                                                          │
│      ┌────────────────────────────────────────────┐      │
│      │           LLM Provider (OpenRouter)        │      │
│      │     (GPT-4, Claude, Llama, Nemotron, etc.) │      │
│      └────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────┘
```

### Request Flow

1. **User Input** → User types message in chat interface
2. **Frontend Processing** → React context updates message state
3. **API Call** → Frontend calls `/api/chat` with message history
4. **Backend Routing** → Next.js API route forwards to FastAPI `/agent/invoke`
5. **Agent Processing** → Agent decides whether to use tools or respond directly
6. **Tool Execution** → If needed, executes calculator or searches documents via RAG
7. **LLM Generation** → Language model generates response
8. **Response Stream** → FastAPI returns JSON response
9. **UI Update** → Frontend displays assistant's message

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and pnpm (for frontend)
- **Python** 3.9+ (for backend)
- **API Keys**:
  - OpenRouter API key (or OpenAI key)
  - Optional: Pinecone API key (for cloud vector storage)

### Installation

#### 1. Clone and Setup

```bash
git clone <repository-url>
cd ui-lab
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_openrouter_api_key_here
OPENAI_API_BASE=https://openrouter.ai/api/v1
LLM_MODEL_ID=nvidia/nemotron-3-nano-30b-a3b:free
PINECONE_API_KEY=your_pinecone_key  # Optional
PINECONE_INDEX_NAME=your_index      # Optional
EOF

# Run the backend
uvicorn app.main:app --reload --port 8000
```

The backend will start on `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Create .env.local file
echo "NEXT_PUBLIC_BACKEND_URL=http://localhost:8000" > .env.local

# Run the development server
pnpm dev
```

The frontend will start on `http://localhost:3000`

### Quick Test

1. Open `http://localhost:3000` in your browser
2. Try asking: "What is 25 * 37?"
3. Try asking: "What is attention in transformers?" (uses the Attention paper in documents)
4. Click the microphone icon to test speech features

---

## 🎨 Frontend Deep Dive

### Project Structure

```
frontend/
├── app/
│   ├── page.tsx              # Main page component
│   ├── layout.tsx            # Root layout with providers
│   ├── config.ts             # Backend URL configuration
│   ├── types.ts              # TypeScript type definitions
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # API route handler
│   ├── components/           # UI components
│   │   ├── Header.tsx
│   │   ├── MessageList.tsx
│   │   ├── ChatInput.tsx
│   │   ├── Message.tsx
│   │   ├── StatusBar.tsx
│   │   ├── Modal.tsx
│   │   ├── SynthModal.tsx    # Speech synthesis UI
│   │   ├── RecogModal.tsx    # Speech recognition UI
│   │   └── styles.ts
│   ├── context/              # React Context providers
│   │   ├── message.tsx       # Message state management
│   │   └── settings.tsx      # Speech settings
│   └── utils/                # Utility functions
│       ├── markdown.ts       # Markdown rendering with KaTeX
│       └── speechSynthesis.ts
└── public/
```

### Key Concepts

#### 1. Context API for State Management

The app uses React Context to manage global state:

**Message Context** (`context/message.tsx`):
- Manages conversation history
- Handles sending messages to backend
- Controls loading states
- Manages status notifications

```typescript
const { messages, isSending, handleSendMessage } = useMessages();
```

**Settings Context** (`context/settings.tsx`):
- Speech synthesis configuration (voice, rate, pitch, volume)
- Language settings for speech recognition
- Persists user preferences

#### 2. Component Architecture

**Main Page** (`page.tsx`):
- Root component orchestrating all UI elements
- Manages modal state (speech synthesis/recognition)
- Connects context to UI components

**Message Flow**:
1. User types in `ChatInput`
2. `handleSendMessage` called from context
3. Message added to state immediately (optimistic update)
4. API call made to backend
5. Response added to `MessageList`
6. `StatusBar` shows current state

#### 3. API Integration

**API Route** (`api/chat/route.ts`):
```typescript
POST /api/chat
{
  messages: [...],      // Conversation history
  sessionId: "uuid"     // Session identifier
}
```

This route:
- Accepts messages from the frontend
- Formats them for LangServe's expected input
- Forwards to backend `/agent/invoke`
- Returns structured response

**Why an API Route?**
- Keeps backend URL private (server-side only)
- Can add middleware (auth, logging, rate limiting)
- Transforms data between frontend and backend formats
- Handles errors gracefully

#### 4. Speech Integration

**Text-to-Speech (Synthesis)**:
- Uses browser's Web Speech API
- Configurable voices, rate, pitch, and volume
- Speaks assistant responses automatically or on-demand

**Speech-to-Text (Recognition)**:
- Real-time speech recognition
- Displays confidence scores
- Multiple language support
- Shows alternatives for recognized text

### Building a New Component

Example: Adding a "Copy Message" button

```typescript
// In components/Message.tsx
const [copied, setCopied] = useState(false);

const handleCopy = () => {
  navigator.clipboard.writeText(message.content);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};

return (
  <div>
    <MarkdownContent content={message.content} />
    <button onClick={handleCopy}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  </div>
);
```

---

## ⚙️ Backend Deep Dive

### Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI app, routes, CORS
│   ├── agent.py          # Agent construction
│   ├── llm.py            # LLM configuration
│   ├── rag.py            # RAG system implementation
│   ├── tools.py          # Agent tools (calculator, search)
│   └── test_rag.py       # RAG system tests
├── documents/            # Knowledge base files
│   └── 1706.03762-Attention_Is_All_You_Need.pdf
└── requirements.txt      # Python dependencies
```

### Core Components

#### 1. FastAPI Server (`main.py`)

```python
app = FastAPI(title="Agentic AI Backend", version="1.0")

# Enable CORS for frontend communication
app.add_middleware(CORSMiddleware, allow_origins=["*"], ...)

# LangServe routes
add_routes(app, agent, path="/agent")      # Agent endpoint
add_routes(app, rag_chain, path="/rag")    # RAG endpoint
```

**LangServe** automatically creates these endpoints:
- `POST /agent/invoke` - Synchronous agent invocation
- `POST /agent/stream` - Streaming responses
- `POST /rag/invoke` - Direct RAG queries
- `GET /agent/playground` - Interactive testing UI

#### 2. LLM Configuration (`llm.py`)

```python
def get_llm():
    return ChatOpenAI(
        model=os.getenv("LLM_MODEL_ID"),
        temperature=0,
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        openai_api_base=os.getenv("OPENAI_API_BASE"),
    )
```

**Key Points**:
- Uses OpenRouter for access to multiple LLM providers
- Compatible with OpenAI API format
- Temperature=0 for consistent, deterministic responses
- Configurable via environment variables

**Supported Models** (via OpenRouter):
- GPT-4, GPT-3.5 (OpenAI)
- Claude 3 (Anthropic)
- Llama 3 (Meta)
- Nemotron (NVIDIA) - Free tier available
- Many more...

#### 3. Tools System (`tools.py`)

Tools give the agent capabilities beyond text generation:

```python
@tool
def calculator(expression: str):
    """Evaluate mathematical expressions"""
    try:
        return str(eval(expression))
    except Exception as e:
        return f"Error: {e}"

@tool
def search_notes(query: str):
    """Search internal ML notes for relevant information"""
    chain = uploader.get_rag_chain()
    message = chain.invoke(query)
    return message.content
```

**How Tools Work**:
1. Agent receives user query
2. LLM decides if a tool is needed
3. LLM generates tool call with parameters
4. Backend executes the tool
5. Result is passed back to LLM
6. LLM incorporates result into final response

**Example**:
- User: "What is 123 * 456?"
- Agent calls: `calculator("123 * 456")`
- Tool returns: `"56088"`
- Agent responds: "The result is 56,088"

#### 4. Agent Construction (`agent.py`)

```python
def get_agent():
    return create_agent(
        model=get_llm(),
        tools=get_tools(),
        system_prompt="You are a helpful assistant. Use the knowledge_base tool when needed.",
    )
```

The **agent** is a LangChain construct that:
- Receives messages
- Decides when to use tools
- Chains multiple tool calls if needed
- Generates natural language responses

---

## 📚 RAG System Explained

### What is RAG?

**Retrieval-Augmented Generation** enhances LLM responses by:
1. **Retrieving** relevant documents from a knowledge base
2. **Augmenting** the prompt with this context
3. **Generating** a response based on both the query and retrieved docs

**Why RAG?**
- LLMs have a knowledge cutoff date
- Can't access private/proprietary information
- Prone to hallucination without grounding
- RAG provides factual, up-to-date, domain-specific knowledge

### Architecture

```
User Query → Embedding → Vector Search → Retrieved Docs → Prompt → LLM → Answer
                ↓                              ↓
           Vector DB                    Hybrid Retrieval
           (FAISS/Chroma)              (BM25 + Semantic)
```

### Components

#### 1. Document Loading

Supports multiple formats:
```python
# Text files
loader = TextLoader(file_path)

# PDFs  
loader = PyPDFLoader(file_path)

# CSV files
loader = CSVLoader(file_path)
```

#### 2. Text Splitting

Large documents are split into chunks:
```python
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # Characters per chunk
    chunk_overlap=50     # Overlap to maintain context
)
```

**Why split?**
- Embeddings work best on focused text segments
- Improves retrieval precision
- Fits within LLM context windows

#### 3. Embeddings

Convert text to numerical vectors:
```python
embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"  # Lightweight, fast model
)
```

**Embeddings** capture semantic meaning:
- Similar texts have similar vectors
- Enables semantic search (not just keyword matching)
- 384-dimensional vectors for MiniLM

#### 4. Vector Stores

Store and search embeddings:

**FAISS** (Facebook AI Similarity Search):
- In-memory, fast
- Good for development and small datasets
- No external dependencies

**Chroma**:
- Persistent storage
- Metadata filtering
- Good for production

**Pinecone**:
- Cloud-hosted
- Scales to billions of vectors
- Managed infrastructure

#### 5. Hybrid Retrieval

Combines two search methods:

**BM25 (Keyword-based)**:
- Traditional ranking algorithm
- Handles exact matches well
- Fast, lightweight

**Vector Search (Semantic)**:
- Uses embeddings
- Captures meaning
- Finds conceptually similar docs

**Ensemble Retriever**:
```python
EnsembleRetriever(
    retrievers=[bm25_retriever, vector_retriever],
    weights=[0.5, 0.5]  # Equal weighting
)
```

**Result**: Best of both worlds!
- Finds exact term matches (BM25)
- Finds semantic matches (vectors)
- More robust retrieval

#### 6. RAG Chain

The complete pipeline:
```python
rag_chain = (
    {
        "context": retriever | format_docs,  # Retrieve and format
        "question": RunnablePassthrough()     # Pass through query
    }
    | prompt_template                         # Create prompt
    | llm                                     # Generate answer
)
```

**Prompt Template**:
```
You are a helpful AI assistant.

Context:
{context}

Question: {question}

Provide an answer based on the context.
```

### Using the RAG System

#### Uploading Documents

On startup, the system automatically loads documents:
```python
uploader = RAGDocumentUploader()
uploader.upload_batch(file_paths=file_paths, base_path="documents/")
```

#### Querying

```python
# Direct RAG query
response = rag_chain.invoke("What is attention in transformers?")

# Via agent tool
agent.invoke("Search the notes for information about attention")
```

### Advanced RAG Techniques (Present in Code)

1. **Chunking Strategy**: RecursiveCharacterTextSplitter maintains context
2. **Hybrid Search**: Combines keyword and semantic retrieval
3. **Configurable Retriever**: Switch between FAISS, Chroma, Pinecone
4. **Ensemble Weights**: Tune BM25 vs vector search importance

---

## 🤖 Agent System Explained

### What is an Agent?

An **agent** is an AI system that:
- **Reasons** about what actions to take
- **Uses tools** to accomplish tasks
- **Plans** multi-step operations
- **Adapts** based on results

Unlike a simple chatbot, agents can:
- Break down complex problems
- Execute code/tools
- Search databases
- Chain multiple operations

### Agent Loop

```
1. Receive user input
2. Generate plan (which tools to use)
3. Execute tool(s)
4. Observe results
5. Decide: done or continue?
6. Generate final response
```

### Agent in This Project

```python
agent = create_agent(
    model=get_llm(),
    tools=[calculator, search_notes],
    system_prompt="You are a helpful assistant. Use tools when needed."
)
```

**Decision Making**:
- "What's 2+2?" → Use calculator tool
- "Tell me about attention" → Use search_notes tool (RAG)
- "Hello!" → Respond directly (no tool needed)

### Tool Execution Example

**User**: "What's 15% of 200, and what does the attention paper say about attention?"

**Agent's Internal Process**:
1. Identifies two tasks: calculation + document search
2. Calls `calculator("200 * 0.15")` → returns "30.0"
3. Calls `search_notes("attention mechanism")` → returns text from paper
4. Synthesizes: "15% of 200 is 30. According to the paper, attention mechanisms..."

### Creating Custom Tools

Add a new tool to `tools.py`:

```python
@tool
def get_weather(location: str):
    """Get current weather for a location"""
    # Your implementation
    return f"Weather in {location}: Sunny, 72°F"

def get_tools():
    return [calculator, search_notes, get_weather]
```

The agent automatically:
- Knows when to use it (from docstring)
- Understands the parameters
- Calls it appropriately

---

## 🎓 Advanced Topics

### 1. Streaming Responses

LangServe supports streaming for real-time responses:

```python
# Client side
async for chunk in stream_response('/agent/stream'):
    print(chunk)
```

Benefits:
- Immediate feedback
- Better UX for long responses
- Lower perceived latency

### 2. Memory and Sessions

Conversation history is maintained via `session_id`:

```python
config: {
    configurable: {
        session_id: sessionId  # Groups messages by conversation
    }
}
```

**Implementing Persistent Memory**:
```python
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
agent = create_agent(model=llm, tools=tools, memory=memory)
```

### 3. Vector Store Selection

**When to use each**:

**FAISS**:
- ✅ Development
- ✅ < 1M vectors
- ✅ Single machine
- ❌ No persistence
- ❌ No scaling

**Chroma**:
- ✅ Production
- ✅ < 10M vectors
- ✅ Persistent storage
- ✅ Metadata filtering
- ❌ Single machine

**Pinecone**:
- ✅ Large scale (billions of vectors)
- ✅ Cloud-native
- ✅ High availability
- ❌ Costs money
- ❌ External dependency

### 4. Embeddings Models

**Trade-offs**:

| Model | Dimensions | Speed | Quality | Size |
|-------|-----------|-------|---------|------|
| all-MiniLM-L6-v2 | 384 | ⚡⚡⚡ | ⭐⭐ | 80MB |
| all-mpnet-base-v2 | 768 | ⚡⚡ | ⭐⭐⭐ | 420MB |
| OpenAI text-embedding-3-large | 3072 | ⚡ | ⭐⭐⭐⭐ | API |

### 5. Prompt Engineering

Current prompt is basic. Improve it:

```python
PROMPT_TEMPLATE = """
You are an expert AI assistant specializing in machine learning.

Context Documents:
{context}

User Question: {question}

Instructions:
- Answer based ONLY on the provided context
- If uncertain, say "I don't have enough information"
- Cite specific parts of the context
- Be concise but thorough

Answer:
"""
```

### 6. Error Handling

Add retry logic and fallbacks:

```python
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential())
def call_llm_with_retry():
    return llm.invoke(prompt)
```

### 7. Evaluation

Test RAG quality:

```python
# In test_rag.py
def test_retrieval_quality():
    query = "What is attention?"
    results = retriever.get_relevant_documents(query)
    
    # Check relevance
    assert len(results) > 0
    assert "attention" in results[0].page_content.lower()
```

### 8. Security Considerations

**Current Issues**:
```python
# tools.py - DANGEROUS!
return str(eval(expression))  # Can execute arbitrary code!
```

**Better Approach**:
```python
import ast
import operator

def safe_eval(expression):
    # Parse and validate
    tree = ast.parse(expression, mode='eval')
    # Only allow math operations
    # Implement safe evaluation
```

**Other Security Tips**:
- Validate all inputs
- Sanitize file uploads
- Rate limit API calls
- Use environment variables for secrets
- Implement authentication

### 9. Performance Optimization

**Backend**:
- Cache embeddings: Don't recompute
- Use smaller models for faster inference
- Batch document processing
- Implement connection pooling

**Frontend**:
- Debounce API calls
- Implement pagination for message history
- Use React.memo for expensive components
- Lazy load modals

### 10. Deployment

**Backend** (FastAPI):
```bash
# Production server
gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

**Frontend** (Next.js):
```bash
npm run build
npm start
```

**Docker**:
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0"]
```

**Environment Variables (Production)**:
- Use secret management (AWS Secrets Manager, Azure Key Vault)
- Never commit `.env` files
- Rotate API keys regularly

---

## 🛠️ Development Workflow

### Running Tests

```bash
# Backend
cd backend
pytest app/test_rag.py -v

# Frontend (if tests added)
cd frontend
pnpm test
```

### Code Quality

**Backend**:
```bash
# Formatting and linting
ruff check app/
ruff format app/
```

**Frontend**:
```bash
# ESLint
pnpm lint
```

### Debugging

**Backend**:
- FastAPI auto-docs: `http://localhost:8000/docs`
- LangServe playground: `http://localhost:8000/agent/playground`
- Python debugger: Add `import pdb; pdb.set_trace()`

**Frontend**:
- React DevTools browser extension
- Console logging: `console.log(messages)`
- Network tab: Inspect API calls

### Adding New Documents

1. Place file in `backend/documents/`
2. Restart backend (auto-loads on startup)
3. Verify: Check startup logs for "Uploading documents..."

```bash
# Should see:
✓ Loaded your-document.pdf: 42 chunks created
```

### Modifying the Agent

**Add a new tool**:
```python
# tools.py
@tool
def my_tool(param: str):
    """Description for the LLM"""
    return f"Result: {param}"

def get_tools():
    return [calculator, search_notes, my_tool]
```

**Change system prompt**:
```python
# agent.py
system_prompt = """
You are a specialized assistant for [DOMAIN].
When users ask about [X], use the search_notes tool.
Always be concise and accurate.
""",
```

### Switching LLM Providers

**Use OpenAI directly**:
```bash
# .env
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1
LLM_MODEL_ID=gpt-4
```

**Use local models** (Ollama):
```bash
# .env
OPENAI_API_BASE=http://localhost:11434/v1
LLM_MODEL_ID=llama3
```

```python
# llm.py - for Ollama
from langchain_community.chat_models import ChatOllama
return ChatOllama(model="llama3")
```

### Common Issues

**Backend won't start**:
- Check Python version: `python --version` (need 3.9+)
- Verify virtualenv: `which python` (should be in venv)
- Check ports: `lsof -i :8000` (kill conflicting process)

**Frontend can't connect**:
- Verify backend is running: `curl http://localhost:8000`
- Check CORS: Look for CORS errors in browser console
- Verify `.env.local`: Should have correct backend URL

**RAG not working**:
- Check documents loaded: Look at startup logs
- Verify vector store built: Check `uploader.get_document_summary()`
- Test retriever: Run `test_rag.py`

**Agent not using tools**:
- Check system prompt mentions tools
- Verify tool docstrings are clear
- Test with explicit request: "Use the calculator to find 2+2"

---

## 📖 Learning Path for Trainees

### Week 1: Fundamentals
1. Run the application end-to-end
2. Experiment with different queries
3. Explore the FastAPI docs (`/docs`)
4. Read through `main.py`, `agent.py`, `tools.py`
5. Modify a system prompt and observe changes

### Week 2: Frontend
1. Study React Context usage in `context/message.tsx`
2. Trace a message from `ChatInput` to `MessageList`
3. Add a new UI component (e.g., timestamp on messages)
4. Customize the styling
5. Implement a "Copy message" feature

### Week 3: RAG System
1. Read `rag.py` thoroughly
2. Add a new document to `documents/`
3. Experiment with chunk sizes and overlaps
4. Try different retriever types (vector, bm25, hybrid)
5. Implement a test for document retrieval

### Week 4: Advanced Topics
1. Create a new custom tool
2. Implement streaming responses
3. Add persistent memory
4. Deploy to a cloud platform
5. Implement basic authentication

---

## 🤝 Contributing

Ideas for improvements:
- [ ] Add user authentication
- [ ] Implement streaming responses in UI
- [ ] Add document upload via web interface
- [ ] Create admin panel for document management
- [ ] Add conversation export (PDF, JSON)
- [ ] Implement multi-modal support (images)
- [ ] Add fine-tuning capabilities
- [ ] Create mobile-responsive design
- [ ] Add dark mode
- [ ] Implement A/B testing for different prompts

---

## 📚 Additional Resources

### LangChain Documentation
- [LangChain Python Docs](https://python.langchain.com/)
- [LangServe](https://github.com/langchain-ai/langserve)
- [LangSmith](https://smith.langchain.com/) - Debugging and monitoring

### RAG Resources
- [RAG Tutorial](https://python.langchain.com/docs/tutorials/rag/)
- [Vector Store Comparison](https://python.langchain.com/docs/integrations/vectorstores/)
- [Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)

### Agent Resources
- [Agent Types](https://python.langchain.com/docs/modules/agents/agent_types/)
- [Custom Tools](https://python.langchain.com/docs/modules/agents/tools/)

### Next.js
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Context](https://react.dev/reference/react/useContext)

---

## 📄 License

[Your License Here]

## 👥 Authors

[Your Name/Team]

---

**Happy Learning! 🚀** 

Start simple, experiment often, and don't be afraid to break things. The best way to learn is by doing!