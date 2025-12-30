# 🛡️ Security Monitoring System

<div align="center">

**An intelligent, privacy-aware security monitoring platform for modern campus environments**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.118-009688.svg)](https://fastapi.tiangolo.com/)

</div>

---

## 📋 Overview

The **Security Monitoring System** is a comprehensive full-stack application designed to provide intelligent security monitoring and entity tracking for campus environments. By leveraging advanced machine learning algorithms and cross-source data integration, the system creates unified activity profiles, detects anomalies, and enables predictive location analysis while maintaining strict privacy standards.

### 🎯 Key Highlights

- **Multi-Source Data Integration**: Consolidates data from 8+ disparate sources including CCTV footage, WiFi associations, campus card swipes, library checkouts, lab bookings, and helpdesk notes
- **Entity Resolution Engine**: Advanced clustering algorithms (DBSCAN/Agglomerative) for cross-source entity linkage, handling cases where the same person appears with different identifiers across systems
- **Predictive Analytics**: ML-powered location prediction using time-weighted features, exponential decay, and collaborative filtering to forecast entity locations with confidence scores
- **Real-Time Monitoring**: Interactive dashboards with chronological timelines, Plotly visualizations, and real-time anomaly alerts
- **Privacy-First Design**: Secure authentication with JWT tokens, role-based access control, and privacy-aware data handling
- **Scalable Architecture**: Modular three-tier design with React frontend, dual Node.js/Python backends, and PostgreSQL/MongoDB databases

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend Layer (React 19)                  │
│  • Vite build system with hot module replacement            │
│  • TailwindCSS for responsive design                        │
│  • React Router for SPA navigation                          │
│  • Plotly & React-Chrono for data visualizations            │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (HTTP/JSON)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│           Backend Layer (Node.js + Express)                 │
│  • JWT-based authentication & authorization                 │
│  • MongoDB integration for user management                  │
│  • Proxy layer for PostgreSQL data queries                  │
│  • Session management with cookie-parser                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls
                       ▼
┌─────────────────────────────────────────────────────────────┐
│        Data Processing Layer (Python + FastAPI)             │
│  • Entity resolution pipeline with clustering               │
│  • ML-based location prediction engine                      │
│  • Timeline generation and event aggregation                │
│  • Face embedding processing and comparison                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL Queries
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Storage Layer                        │
│  • PostgreSQL: Activity logs, timelines, embeddings         │
│  • MongoDB: User accounts, sessions, preferences            │
│  • File System: CCTV frames and face images                 │
└─────────────────────────────────────────────────────────────┘
```

### Data Pipeline Flow

1. **Data Ingestion**: Multi-format CSV data ingestion with schema validation and error handling
2. **Preprocessing**: Data cleaning, normalization, timestamp standardization, and feature extraction
3. **Entity Resolution**: Clustering-based cross-source entity linkage using multiple identifier types
4. **Timeline Generation**: Chronological event aggregation per entity with multi-source correlation
5. **ML Training**: Time-weighted feature engineering with exponential decay and cluster analysis
6. **Prediction**: Real-time location prediction with confidence scoring and nearby suggestions
7. **Visualization**: RESTful API exposure for frontend consumption with optimized queries

---

## 🚀 Installation

**Prerequisites:** Node.js (v18+), Python (3.11+), PostgreSQL (v14+), MongoDB (v6+)

### Quick Start

```bash
# Clone repository
git clone https://github.com/piyush-kumar-kedia/Security-Monitoring-System.git
cd Security-Monitoring-System

# Python setup
cd py_scripts
python -m venv venv
venv\Scripts\activate  # On Windows
pip install -r requirements.txt
# Create .env with DB credentials
python pipeline.py
python main.py  # Runs on port 8000

# Backend setup
cd ../Backend
npm install
# Create .env with MongoDB URI, JWT secret
npm run dev  # Runs on port 3000

# Frontend setup
cd ../frontend
npm install
npm run dev  # Runs on port 5173
```

### Environment Configuration

Create `.env` files in the respective directories with the following format:

**py_scripts/.env**
```env

DB_MAIN_NAME=name
DB_MAIN_USER=user
DB_MAIN_PASSWORD=password
DB_MAIN_HOST=localhost
DB_MAIN_PORT=5432

DB_IMAGES_NAME=name
DB_IMAGES_USER=user
DB_IMAGES_PASSWORD=password
DB_IMAGES_HOST=localhost
DB_IMAGES_PORT=5432
```

**Backend/.env**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/security_monitoring
JWT_SECRET=your_jwt_secret_key

DB_MAIN_NAME=name
DB_MAIN_USER=user
DB_MAIN_PASSWORD=password
DB_MAIN_HOST=localhost
DB_MAIN_PORT=5432
```

---

## 💻 Usage

**Start Services:** PostgreSQL → MongoDB → Python FastAPI (8000) → Node.js Express (3000) → React (5173)

**Key API Endpoints:**
- `POST /train` - Train ML model
- `POST /predict` - Predict location
- `POST /query` - Query timelines
- `POST /auth/register` - User registration
- `GET /api/entities` - List entities
- `GET /api/alerts` - Get alerts

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.1 with Vite for fast development and optimized builds
- **Styling**: TailwindCSS 4.1 for utility-first responsive design
- **Routing**: React Router DOM 7.9 for client-side navigation
- **Visualizations**: Plotly.js for interactive graphs, React-Chrono for timeline displays
- **UI Components**: Lucide React icons, React Loading Skeleton for smooth loading states

### Backend (Node.js)
- **Framework**: Express 5.1 for RESTful API development
- **Database**: Mongoose 8.19 (MongoDB ODM), pg 8.16 (PostgreSQL driver)
- **Authentication**: JWT with bcrypt password hashing
- **Middleware**: CORS for cross-origin requests, cookie-parser for session management

### Backend (Python)
- **Framework**: FastAPI 0.118 with Pydantic validation
- **Server**: Uvicorn 0.37 ASGI server
- **Data Processing**: Pandas 2.3, NumPy 2.3 for data manipulation
- **Machine Learning**: Scikit-learn 1.7 for clustering and prediction algorithms

### Database
- **PostgreSQL**: Structured data storage with optimized indexes for fast queries
- **MongoDB**: User authentication and session management

---

## 📊 Database Schema

### PostgreSQL Tables
- **profiles**: Student/staff identity information and demographics
- **campus_card_swipes**: Physical access logs with location and timestamp
- **wifi_associations**: Network connection records with MAC addresses
- **library_checkouts**: Book borrowing history and timestamps
- **lab_bookings**: Laboratory reservation data with time slots
- **cctv_frames**: Video surveillance metadata with image references
- **face_embeddings**: Facial recognition vectors for identity matching
- **free_text_notes**: Helpdesk tickets and RSVP text data

### Performance Optimization
- **Indexed Fields**: Entity IDs, timestamp ranges, location fields
- **Composite Indexes**: Multi-column indexes for complex temporal and spatial queries
- **Query Optimization**: Materialized views and query caching for frequently accessed timelines

---

## 🎓 Machine Learning Components

### Entity Resolution Algorithm
- **Clustering Approach**: DBSCAN and Agglomerative Clustering for grouping related records
- **Multi-Modal Matching**: Combines student IDs, WiFi MAC addresses, and face embeddings
- **Features**: Temporal correlation (time proximity), spatial proximity (location overlap), and identifier matching
- **Confidence Scoring**: Probabilistic matching with configurable thresholds for entity linkage

### Location Prediction Model
- **Feature Engineering**:
  - Time-windowed historical patterns (configurable window size)
  - Exponential temporal decay (recent activities weighted higher)
  - Day-of-week and hour-of-day encoding for periodic patterns
  - Cluster-based collaborative filtering from similar entities
- **Ensemble Approach**: Combines location frequency analysis with cluster pattern matching
- **Output**: Primary location prediction with confidence score plus ranked nearby alternatives

---

## 🔒 Security

JWT authentication, bcrypt password hashing, role-based access control, protected routes, CORS configuration

---

## 👥 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## � Team

This project is a collaborative effort by a dedicated team of developers working together to create a comprehensive security monitoring solution for modern campus environments.

- Repository: [Security-Monitoring-System](https://github.com/piyush-kumar-kedia/Security-Monitoring-System)

---

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Inspiration from modern campus security challenges and privacy-preserving technologies
- Open-source libraries and frameworks that made this project possible

---

<div align="center">

**⭐ If you find this project useful, please consider giving it a star! ⭐**

Made with ❤️ for safer, smarter campuses

</div>
