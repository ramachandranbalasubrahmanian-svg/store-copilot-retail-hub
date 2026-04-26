# Store Copilot - Intelligent Retail Management

Store Copilot is a next-generation retail operations platform designed to bridge the gap between executive strategy and store-floor execution.

## 🎯 Strategic Impact
Store Copilot is built on the principles of **Agentic Intelligence** to resolve systemic fragmentation in retail data. It transitions retail operations from passive data warehouses to active **Intelligence Engines**.

For a deep dive into the business advantages, economic impact, and the strategic reasoning behind this prototype, see [**BENEFITS.md**](./BENEFITS.md).

## 🚀 Features
- **🧠 Agentic Intelligence**: Real-time decision support for frontline staff.
- **📊 Executive Suite**: Single Source of Truth for revenue and performance.
- **📦 Inventory workbench**: AI-driven demand sensing and stock optimization.
- **⚡ Store Operations**: Live "Day in the Life" monitoring and task execution.
- **🔄 Live Sync**: Real-time state synchronization via Firebase.

## 🛠 Tech Stack
- React 18 / Vite
- Tailwind CSS
- Firebase (Firestore & Auth)
- Framer Motion
- Recharts

## 📖 Architecture
Detailed documentation and system diagrams can be found in [ARCHITECTURE.md](./ARCHITECTURE.md).

## 💻 Getting Started

1. **Setup Firebase**:
   - Create a Firebase project.
   - Enable Firestore and Google Authentication.
   - Create a `.env` file based on `.env.example` and populate it with your Firebase credentials.
    - Alternatively, you can update `firebase-applet-config.json` with your credentials for local development, but ensure it is not committed if you want to avoid security alerts.

2. **Environment Variables**:
   For the app to work, ensure you set the following in your environment or a `.env` file:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`
   - (And other `VITE_FIREBASE_*` variables listed in `.env.example`)

3. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 📄 License
MIT
