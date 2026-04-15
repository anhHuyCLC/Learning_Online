# Deploy Frontend and Backend Separately

This project is now structured so frontend and backend can run and deploy independently.

## 1) Backend Deploy

Backend source lives in `backend/`.

### Backend commands

- Install dependencies: `npm install`
- Run in development: `npm run dev`
- Validate TypeScript: `npm run build`
- Run production entry: `npm run start`

### Backend environment variables

Create `backend/.env` from this template:

```env
SQLITE_DB_PATH=./data/learning_online.sqlite

PORT=3000
NODE_ENV=production

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Comma-separated frontend domains allowed by CORS
FRONTEND_URL=http://localhost:5173,https://your-frontend-domain.com
```

## 2) Frontend Deploy

Frontend source lives in `frontend/`.

### Frontend commands

- Install dependencies: `npm install`
- Run in development: `npm run dev`
- Build for production: `npm run build`
- Preview build locally: `npm run preview`

### Frontend environment variables

Create `frontend/.env` (or `frontend/.env.production`) and set:

```env
VITE_API_URL=https://your-backend-domain.com
```

## 3) Root commands (optional local convenience)

From project root you can still use:

- `npm run dev` to run both apps together
- `npm run build` to run backend and frontend build flows

## 4) Suggested deploy setup

- Deploy backend from the `backend/` folder.
- Deploy frontend from the `frontend/` folder.
- Set `VITE_API_URL` to your backend domain.
- Set `FRONTEND_URL` to your frontend domain.
