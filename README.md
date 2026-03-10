# SpillThePill 💊
AI-Powered Drug Information Simplifier

SpillThePill is a full-stack application that helps users understand prescription medications by turning complex medical descriptions into clear, easy-to-read explanations.

The system integrates trusted drug data sources and uses an LLM to generate simplified explanations of medications.

---

## Problem

Drug labels and medical databases often contain technical language that is difficult for everyday users to understand.

SpillThePill addresses this problem by retrieving authoritative drug information and simplifying it using AI, making medication information easier and safer to understand.

---

## System Architecture

Frontend
- React Native
- Expo
- TypeScript
- Cross-platform support (Web, iOS, Android)

Backend
- Node.js
- Express.js REST API
- TypeScript

AI Layer
- Google Gemini 1.5 Flash
- Generates simplified or detailed drug explanations

External Data Sources
- RxNav
- MedlinePlus
- DailyMed

---

## System Flow

User searches for a medication  
→ Frontend sends request to backend API  
→ Backend retrieves drug data from medical APIs  
→ Google Gemini generates simplified explanation  
→ Processed result returned to frontend  

---

## Key Features

- Drug name search with autocomplete
- AI-generated simplified explanations
- Simplified vs detailed explanation modes
- Multi-language AI responses
- PillBot assistant for medication questions
- JWT-based authentication
- Saved medicines for logged-in users
- Cross-platform support (Web / iOS / Android)

---

## Tech Stack

Frontend
- React Native
- Expo
- TypeScript

Backend
- Node.js
- Express
- TypeScript

AI
- Google Gemini

Auth
- JWT authentication
- Optional Auth0 integration

Tools
- Postman for API testing
- GitHub for version control

---

## Running the Project

Clone the repository

git clone https://github.com/pizza3202/spill-the-pill.git  
cd spill-the-pill

Install backend dependencies

cd backend  
npm install  

Start backend server

npm run dev  

Server runs at

http://localhost:5050

Run frontend

cd ../frontend  
npm install  
npx expo start  

Press **w** to run the web app  
Press **i** for iOS simulator  
Scan QR for Android

---

## Example API Endpoints

Authentication

POST /auth/signup  
POST /auth/login  
GET /auth/profile  

Drug APIs

GET /drugs/autocomplete  
GET /drugs/info/:rxcui  
GET /drugs/simplify/:rxcui  

---

## My Contribution

All core backend APIs, LLM integration, and system architecture were implemented by me.

Key work includes:

- Implemented RxNav drug autocomplete integration
- Built backend API architecture using Node.js and Express
- Integrated Google Gemini for AI-generated explanations
- Implemented authentication using JWT
- Designed backend services for drug data retrieval and processing
- Conducted API testing using Postman

---

## Future Improvements

Potential enhancements include:

- Replace in-memory user store with a database
- Add caching to reduce external API calls
- Improve AI prompts for dosage warnings and safety alerts
- Deploy the system using containerized infrastructure
