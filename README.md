# Monica - Conversational AI Health Assistant

A conversational AI avatar assistant for healthcare clinics, featuring HeyGen's Streaming Avatar and OpenAI GPT-4.

[LIVE](https://monica-chatbot-apea.onrender.com)

## 🌟 Features

- **HeyGen Streaming Avatar**: Real-time lip-synced avatar for natural conversation
- **GPT-4 Powered Conversations**: Intelligent, context-aware responses
- **Medical Guardrails**: Built-in safety for emergency detection and medical advice refusal
- **Multi-tenant Ready**: Configurable for multiple clinic deployments
- **Modern UI**: Beautiful, responsive interface with TailwindCSS

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Avatar Panel │  │ Chat Panel   │  │ CTA Buttons  │      │
│  │ (HeyGen SDK) │  │ (Messages)   │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ ChatModule   │  │ HeyGenModule │  │ GuardrailsSvc│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ OpenAI   │  │ HeyGen   │  │ Future:  │
        │ GPT-4    │  │ Avatar   │  │ GHL/EHR  │
        └──────────┘  └──────────┘  └──────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key
- HeyGen API key

### Quick Install (Recommended)

```bash
# Install all dependencies
npm run install:all

# Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Run in development mode (both frontend & backend)
npm run dev
```

### Manual Setup

**Backend:**

```bash
cd backend
npm install
cp .env.example .env
npm run start:dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Development URLs

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3002/api

## 🚢 Deployment

### Single Service Deployment

Both frontend and backend can be deployed as a **single service**. The Next.js frontend is built as static files and served by NestJS.

```bash
# Build everything
npm run build

# Start production server
npm run start
```

Production URL: `http://localhost:3002` (frontend + API)

### Available Scripts

| Command               | Description                                          |
| --------------------- | ---------------------------------------------------- |
| `npm run install:all` | Install dependencies for root, frontend & backend    |
| `npm run dev`         | Run both frontend & backend in dev mode (hot reload) |
| `npm run build`       | Build both frontend and backend for production       |
| `npm run start`       | Start production server (single service)             |
| `npm run format`      | Format all code with Prettier                        |

### Docker Deployment

```bash
# Build the image
docker build -t monica .

# Run the container
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e OPENAI_API_KEY=sk-xxx \
  -e HEYGEN_API_KEY=xxx \
  -e CLINIC_NAME="Your Clinic" \
  monica
```

### Platform Deployments

**Railway / Render / Heroku:**

- Build command: `npm run build`
- Start command: `npm run start`
- Set environment variables in dashboard

**Environment Variables for Production:**

```
PORT=3000
OPENAI_API_KEY=sk-xxx
HEYGEN_API_KEY=xxx
CLINIC_NAME=Your Clinic
CLINIC_ID=your-clinic
```

## 📁 Project Structure

```
convo-bot/
├── backend/                    # NestJS Backend
│   ├── src/
│   │   ├── chat/              # Chat module & endpoints
│   │   ├── heygen/            # HeyGen integration
│   │   ├── openai/            # OpenAI GPT-4 integration
│   │   ├── guardrails/        # Safety & compliance
│   │   ├── prompts/           # Monica's system prompt
│   │   └── config/            # Multi-tenant config
│   └── package.json
│
├── frontend/                   # Next.js Frontend
│   ├── src/
│   │   ├── app/               # Next.js app router
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # Utilities & API client
│   └── package.json
│
└── README.md
```

## 🔒 Guardrails

Monica includes several safety guardrails:

### Emergency Detection

Triggers for keywords like "chest pain", "suicidal", "can't breathe" - immediately provides emergency response.

### Medical Advice Refusal

Detects requests for specific dosages or medication recommendations and politely redirects to clinicians.

### PHI Protection

Monica never asks for or stores Protected Health Information (DOB, SSN, full medical history).

## 🎯 Key Endpoints

### Backend API

| Endpoint              | Method | Description                   |
| --------------------- | ------ | ----------------------------- |
| `/api/chat`           | POST   | Send message and get response |
| `/api/chat/greeting`  | GET    | Get initial greeting          |
| `/api/heygen/token`   | POST   | Get HeyGen access token       |
| `/api/heygen/session` | POST   | Create streaming session      |

## ⚙️ Configuration

### Environment Variables

**Backend (`backend/.env`)**

```bash
# Required
OPENAI_API_KEY=sk-...
HEYGEN_API_KEY=...

# Optional (defaults shown)
PORT=3002
CLINIC_NAME=Primal Health
CLINIC_ID=primal-health
```

**Frontend (`frontend/.env.local`)** - Only needed for development

```bash
# For development when running frontend separately
NEXT_PUBLIC_API_URL=http://localhost:3002/api
```

> **Note:** In production (single-service deployment), the frontend automatically uses `/api` as the base URL since both are served from the same origin.

## 🎨 Customization

### Changing the Clinic

Edit `backend/src/config/clinic.config.ts` to customize:

- Clinic name and tagline
- Services offered
- CTA buttons
- Competitor mention (Allen/Ways2Well)

### Modifying Monica's Persona

Edit `backend/src/prompts/monica.prompt.ts` to customize:

- Personality and tone
- Knowledge base
- Response templates
- Guardrail messages

## 🔌 Embedding the Widget

Monica can be embedded on any website as a floating chat widget.

### Method 1: Script Tag (Recommended)

Add this script to your website's HTML:

```html
<script
  src="https://your-monica-domain.com/embed.js"
  data-clinic="Your Clinic Name"
  data-color="#14b8a6"
  data-position="bottom-right"
></script>
```

**Options:**
| Attribute | Description | Default |
|-----------|-------------|---------|
| `data-clinic` | Your clinic name shown in widget | Primal Health |
| `data-color` | Primary color (hex) | #14b8a6 |
| `data-position` | Widget position: `bottom-right` or `bottom-left` | bottom-right |

### Method 2: iFrame

```html
<iframe
  src="https://your-monica-domain.com/widget?clinic=Your%20Clinic&color=%2314b8a6"
  style="position: fixed; bottom: 0; right: 0; width: 450px; height: 700px; border: none; z-index: 9999;"
  allow="microphone; camera"
></iframe>
```

### Demo Pages

**Development Mode:**

- **Full Page**: `http://localhost:3001` - Full-screen Monica experience

**Production Mode (single service):**

- **Full Page**: `http://localhost:3002` - Full-screen Monica experience
- **API Health**: `http://localhost:3002/api` - API status check

### JavaScript API

When using the embed script, you can control the widget programmatically:

```javascript
// Open the chat widget
MonicaWidget.open();

// Close the chat widget
MonicaWidget.close();

// Remove the widget entirely
MonicaWidget.destroy();
```

## 📝 Demo Recording Tips

1. **Start with the greeting** - Monica mentions she's more effective than Allen at Ways2Well
2. **Ask about services** - "What kind of bloodwork do you offer?"
3. **Test guardrails** - Ask "How many mg of testosterone should I take?"
4. **Emergency test** - Mention "chest pain" to see emergency response
5. **Show CTA flow** - Demonstrate booking and bloodwork info buttons
6. **Voice input** - Click the microphone to ask questions by voice

## 🔮 Future Enhancements

- [ ] GoHighLevel integration for lead capture
- [ ] HIPAA-compliant scheduler integration
- [x] Voice input with Web Speech API
- [x] Single-service deployment (frontend + backend)
- [x] Docker containerization
- [x] Embeddable widget
- [ ] Multi-language support
- [ ] Conversation analytics dashboard

## 📄 License

Proprietary - All rights reserved.
