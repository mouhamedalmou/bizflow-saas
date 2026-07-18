# BizFlow SaaS

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazonaws)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions)

![BizFlow Dashboard](./screenshots/dashboard.png)

**BizFlow** è una piattaforma SaaS moderna, full-stack per la gestione dell'inventario, ordini prodotti, dashboard clienti e analytics admin. 

🚀 **Production-ready** con TypeScript, CI/CD automatizzato, dark/light theme, modern typography e deploy containerizzato su AWS EC2.

---

## 🌐 Live Demo

**Frontend:** https://bizflowsaas.duckdns.org  
**Backend API:** https://bizflowsaas.duckdns.org/api  
**Health Check:** https://bizflowsaas.duckdns.org/api/health

---

## ✨ Features

### 🔐 Autenticazione & Sicurezza
- JWT authentication con refresh tokens
- Role-based authorization (admin/customer)
- Password hashing con bcryptjs
- Protected routes con middleware
- Persistent login con localStorage

### 📦 Product Management
- CRUD operazioni su prodotti
- Gestione stock in tempo reale
- Upload immagini AWS S3
- Categorizzazione prodotti
- SKU management

### 📋 Orders System
- Creazione ordini customer
- Order history personalizzato
- Admin order management
- Order lifecycle tracking (pending → delivered)
- Status workflow con validazioni

### 📊 Dashboard Analytics
- Revenue charts (Recharts)
- Orders analytics con pie charts
- Monthly sales trends
- Business KPIs real-time
- Empty states + loading indicators

### 🎨 UI/UX Moderno
- **Dark/Light mode** con toggle theme
- **Modern typography**: Geist, Inter, JetBrains Mono
- Responsive design (mobile-first)
- Sidebar collapsibile su mobile
- Toast notifications
- Loading skeletons
- Smooth transitions

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Vite** (build tool ultra-veloce)
- **Tailwind CSS** (utility-first + dark/light mode)
- **React Router DOM** (SPA routing)
- **Axios** (HTTP client con interceptors)
- **Context API** (state management auth)
- **Recharts** (data visualization)
- **Lucide React** (modern icons)
- **React Hot Toast** (notifications)

### Backend
- **Node.js 18** + **Express.js**
- **TypeScript** (full type safety)
- **MongoDB Atlas** (cloud database)
- **Mongoose** (ODM con validation)
- **JWT** (authentication)
- **bcryptjs** (password hashing)
- **Multer** (file uploads)
- **AWS SDK v3** (S3 integration)
- **CORS** + security middleware

### Cloud & DevOps
- **AWS EC2** (Ubuntu Server - production)
- **AWS S3** (product images storage)
- **MongoDB Atlas** (managed database)
- **Docker & Docker Compose** (multi-stage builds)
- **Nginx** (reverse proxy + HTTPS)
- **Let's Encrypt** (SSL/TLS)
- **GitHub Actions** (CI/CD pipeline)
- **DuckDNS** (custom domain)

---

## 🚀 Architecture

### Production Deployment
```
┌─────────────────────────────────────────┐
│         Client Browser                  │
└──────────────┬──────────────────────────┘
               │
       https://bizflowsaas.duckdns.org
               │
┌──────────────▼──────────────────────────┐
│    Nginx Reverse Proxy (HTTPS)          │
│    - SSL/TLS (Let's Encrypt)            │
│    - Route / → frontend:80              │
│    - Route /api → backend:5000          │
└──────────────┬──────────────────────────┘
               │
    ┌──────────┴──────────┐
    │                     │
┌───▼────────────┐  ┌────▼──────────┐
│  Frontend      │  │  Backend      │
│  Container     │  │  Container    │
│  nginx:alpine  │  │  node:alpine  │
│  (dist/)       │  │  (dist/)      │
└───┬────────────┘  └────┬──────────┘
    │                    │
    │              ┌─────▼──────────┐
    │              │  MongoDB Atlas  │
    │              │  (Cloud DB)     │
    │              └────────────────┘
    │
    └─────────────────────────────────┐
                                      │
                    ┌─────────────────▼─┐
                    │  AWS S3 Bucket    │
                    │  (Product Images) │
                    └───────────────────┘
```

### CI/CD Pipeline (GitHub Actions)
```
Push to main
    │
    ├─ Type Check (tsc --noEmit)
    ├─ Lint (ESLint)
    ├─ Build (tsc, vite build)
    ├─ Docker Build (multi-stage)
    ├─ Health Checks (curl endpoints)
    └─ Deploy to AWS EC2
```

---

## 🔧 Installation & Setup

### Prerequisiti
- Node.js 18+
- Docker & Docker Compose
- MongoDB Atlas account
- AWS S3 bucket + IAM credentials
- Git

### Clone Repository
```bash
git clone https://github.com/mouhamedalmou/bizflow-saas.git
cd bizflow-saas
```

### Backend Setup
```bash
cd backend
npm install

# Crea .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/bizflow
JWT_SECRET=your_secure_jwt_secret_key
CLIENT_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173
API_URL=http://localhost:5000

AWS_REGION=eu-west-1
AWS_BUCKET_NAME=your-s3-bucket
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
EOF

# Type check
npm run type-check

# Lint
npm run lint

# Development
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install

# Crea .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Type check
npm run type-check

# Lint
npm run lint

# Development
npm run dev
```

Accedi a **http://localhost:5173**

---

## 📦 Package.json Scripts

### Backend
```bash
npm run type-check    # TypeScript type validation
npm run lint          # ESLint + code quality
npm run build         # Compile TypeScript → dist/
npm run dev           # Development con nodemon
npm run start         # Production mode
```

### Frontend
```bash
npm run type-check    # TypeScript type validation
npm run lint          # ESLint + code quality
npm run build         # Vite build → dist/
npm run preview       # Preview production build
npm run dev           # Development con HMR
```

---

## 🐳 Docker & Production Deployment

### Build Production Images
```bash
# Multi-stage builds (ottimizzati per size)
docker-compose -f docker-compose.prod.yml build

# Avvia containers
docker-compose -f docker-compose.prod.yml up -d

# Health check
curl http://localhost/health          # Frontend
curl http://localhost:5000/health     # Backend
```

### Docker Files Highlights
- **Backend**: Node.js 18-alpine → tsc compile → node dist/server.js
- **Frontend**: Node.js builder → vite build → Nginx alpine
- **Nginx**: Reverse proxy, SPA routing, gzip, caching headers

---

## 🔐 Environment Variables

### Backend `.env.production`
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/bizflow
JWT_SECRET=your_very_secure_jwt_secret_min_32_chars
CLIENT_URL=https://bizflowsaas.duckdns.org
CORS_ORIGIN=https://bizflowsaas.duckdns.org
API_URL=https://bizflowsaas.duckdns.org/api

AWS_REGION=eu-west-1
AWS_BUCKET_NAME=bizflow-images
AWS_ACCESS_KEY_ID=your_iam_access_key
AWS_SECRET_ACCESS_KEY=your_iam_secret_key
```

### Frontend `.env.production`
```env
VITE_API_URL=https://bizflowsaas.duckdns.org/api
```

---

## 📡 API Routes

### Authentication
```bash
POST   /api/auth/register          # Registrazione user
POST   /api/auth/login             # Login con JWT
GET    /api/auth/me                # Current user (protected)
POST   /api/auth/logout            # Logout
```

### Products
```bash
GET    /api/products               # Lista prodotti (paginated)
GET    /api/products/:id           # Dettagli prodotto
POST   /api/products               # Crea prodotto (admin)
PUT    /api/products/:id           # Aggiorna prodotto (admin)
DELETE /api/products/:id           # Cancella prodotto (admin)
GET    /api/products/low-stock     # Prodotti sotto soglia (admin)
```

### Orders
```bash
POST   /api/orders                 # Crea ordine (customer)
GET    /api/orders/my-orders       # Ordini personali
GET    /api/orders                 # Lista tutti ordini (admin)
GET    /api/orders/:id             # Dettagli ordine
PUT    /api/orders/:id/status      # Aggiorna status (admin)
DELETE /api/orders/:id             # Cancella ordine
```

### Dashboard
```bash
GET    /api/dashboard/stats        # KPI: users, products, orders, revenue
GET    /api/dashboard/revenue      # Ricavi per periodo
GET    /api/dashboard/orders-trend # Trend ordini ultimi 30gg
GET    /api/dashboard/top-products # Prodotti più venduti
```

### Upload
```bash
POST   /api/upload/image           # Upload immagine su S3
```

---

## 🎨 UI/UX Features

### Theme System
- **Dark Mode** (default): slate-950 base, indigo-600 accent
- **Light Mode**: slate-50 base, high contrast
- **Toggle**: Pulsante in header, salvo preferenza in localStorage
- **Modern Fonts**: Geist (headers), Inter (body), JetBrains Mono (data)

### Responsive Design
- **Mobile** (< 640px): 1 column, sidebar overlay
- **Tablet** (640-1024px): 2 columns, sidebar narrow
- **Desktop** (> 1024px): Full layout, sidebar fixed, 3+ columns

### Component Library
- **Button**: variant (primary/secondary/danger), size (sm/md/lg), states
- **Card**: elevation, hover effects, interactive
- **Modal**: Dark overlay, focus trap, ESC key close
- **Table**: Sortable columns, pagination, alternating rows
- **Badge**: Status colors (pending, processing, shipped, delivered)
- **LoadingSpinner**: Skeleton loaders, progress bars
- **Toast**: Auto-dismiss notifications (success/error/warning)

---

## 🔄 GitHub Actions CI/CD

### Workflow File: `.github/workflows/docker-ci.yml`

```yaml
Triggers: Push main, Pull requests main

Jobs:
  ✓ TypeScript Type Check (backend + frontend)
  ✓ ESLint Lint (backend + frontend)
  ✓ Build (tsc, vite)
  ✓ Docker Build (multi-stage images)
  ✓ Health Checks (curl endpoints)
  ✓ Cleanup (prune images)
```

### Deploy to AWS EC2
```bash
# SSH into EC2
ssh -i key.pem ubuntu@<ec2-ip>

# Pull latest images
docker pull yourusername/bizflow-backend:latest
docker pull yourusername/bizflow-frontend:latest

# Deploy
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Verify
curl https://bizflowsaas.duckdns.org/health
```

---

## 📊 MongoDB Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  name: string,
  role: enum ['admin', 'customer'],
  avatar?: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Products Collection
```typescript
{
  _id: ObjectId,
  name: string (unique),
  description: string,
  price: number,
  stock: number,
  category: ObjectId (ref),
  imageUrl: string (S3 URL),
  sku: string (unique),
  createdBy: ObjectId (ref),
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref),
  items: [
    { productId: ObjectId, quantity: number, priceAtTime: number }
  ],
  totalPrice: number,
  status: enum ['pending', 'processing', 'shipped', 'delivered'],
  shippingAddress: { street, city, zip, country },
  notes?: string,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing & Quality

### Type Safety
```bash
# Frontend type check
cd frontend && npm run type-check

# Backend type check
cd backend && npm run type-check
```

### Code Quality
```bash
# Frontend lint
cd frontend && npm run lint

# Backend lint
cd backend && npm run lint
```

### Local Testing
```bash
# Backend health check
curl http://localhost:5000/health

# Frontend
curl http://localhost/

# API test
curl -H "Authorization: Bearer <jwt_token>" \
     http://localhost:5000/api/dashboard/stats
```

---

## 🚀 Performance

- **Frontend Build Size**: ~250KB (gzipped) - Vite optimized
- **Backend Startup**: ~2s (production mode)
- **Database Queries**: Indexed on frequently used fields
- **Image Optimization**: S3 CloudFront CDN support
- **Caching**: Nginx cache headers, browser caching
- **Compression**: Gzip on all responses

---

## 🔒 Security Features

- ✅ HTTPS/TLS con Let's Encrypt
- ✅ JWT authentication (secure tokens)
- ✅ CORS configurato per dominio specifico
- ✅ Password hashing con bcryptjs (10 salt rounds)
- ✅ SQL Injection prevention (Mongoose)
- ✅ XSS protection (React auto-escape)
- ✅ CSRF tokens (opzionale)
- ✅ Rate limiting (opzionale)
- ✅ Environment variables (.env non committate)

---

## 🎯 Future Improvements

- [ ] Stripe payments integration
- [ ] Email notifications (SendGrid)
- [ ] Real-time updates (WebSockets)
- [ ] Advanced reporting + export CSV
- [ ] Multi-language support (i18n)
- [ ] Two-factor authentication (2FA)
- [ ] API rate limiting
- [ ] Search full-text MongoDB
- [ ] Analytics avanzate (ChartJS)
- [ ] Mobile app (React Native)

---

## 📚 Learning Goals

Questo progetto è stato costruito per imparare e praticare:

- ✅ MERN stack moderno (React 18, Node.js 18)
- ✅ TypeScript strict mode (full type safety)
- ✅ Full-stack authentication (JWT + refresh tokens)
- ✅ AWS cloud integration (S3, EC2, MongoDB Atlas)
- ✅ Docker workflows (multi-stage builds)
- ✅ CI/CD automation (GitHub Actions)
- ✅ Production-ready UI/UX (dark/light mode, responsive)
- ✅ REST API design (conventions, error handling)
- ✅ Real-world debugging e troubleshooting
- ✅ SaaS application structure

---

## 📁 Folder Structure

### Frontend
```
frontend/
├── src/
│   ├── api/              # Axios hooks e utilities
│   ├── components/       # Reusable UI components
│   ├── context/          # Context API (auth, theme)
│   ├── pages/            # Route pages
│   ├── routes/           # Route definitions
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Helper functions
│   ├── App.tsx
│   └── main.tsx
├── public/               # Static assets
├── dist/                 # Build output
├── Dockerfile.prod       # Multi-stage production build
├── nginx.conf           # Reverse proxy config
├── tailwind.config.js   # Tailwind CSS config
├── tsconfig.json        # TypeScript config
└── package.json
```

### Backend
```
backend/
├── src/
│   ├── config/          # Database config
│   ├── controllers/      # Route handlers
│   ├── middleware/       # Auth, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── types/           # TypeScript interfaces
│   ├── scripts/         # Seed database
│   └── server.ts        # Express server
├── dist/                # Compiled JavaScript
├── Dockerfile.prod      # Multi-stage production build
├── tsconfig.json        # TypeScript config
└── package.json
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

Questo progetto è open source e disponibile sotto la licenza MIT.

---

## 👨‍💻 Author

**Mouhamed Almou Inguidazane**

Full-Stack MERN Developer | TypeScript | AWS | Docker

- 🔗 **GitHub**: https://github.com/mouhamedalmou
- 💼 **LinkedIn**: https://www.linkedin.com/in/almou-inguidazane-mouhamed
- 🌐 **Portfolio**: https://bizflowsaas.duckdns.org

---

## 📞 Support

Per domande o problemi:
1. Apri un **GitHub Issue**
2. Controlla la **documentazione**
3. Contatta via **LinkedIn**

---

## 🙏 Acknowledgments

- React 18 team per il framework
- Tailwind CSS per l'utility-first styling
- MongoDB Atlas per il managed database
- AWS per l'infrastructure cloud
- Docker per la containerization
- GitHub Actions per la CI/CD automation

---

**Ultimo aggiornamento**: Luglio 2026  
**Status**: ✅ Production-Ready

---

## 🔗 Quick Links

| Link | Descrizione |
|------|------------|
| [Live App](https://bizflowsaas.duckdns.org) | Production deployment |
| [API Docs](https://bizflowsaas.duckdns.org/api) | Backend API root |
| [GitHub](https://github.com/mouhamedalmou/bizflow-saas) | Source code repository |
| [Issues](https://github.com/mouhamedalmou/bizflow-saas/issues) | Bug reports & features |
| [Discussions](https://github.com/mouhamedalmou/bizflow-saas/discussions) | Community discussions |

---

Made with ❤️ by Mouhamed Almou Inguidazane