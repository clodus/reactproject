# react project

# ENV PYTHON
python -m venv .venv
source .venv/Scripts/activate

# BACK
cd backend
mv .env_local .env
pip install -r requirements.txt
uvicorn app.main:app --reload

# Docker pour BDD
cd backend
docker compose up -d

# FRONT
cd frontend 
npm install
npm run dev
