# Her's - Breast Cancer Early Detection and Awareness

## Project Overview
Her's is a comprehensive full-stack application designed to promote breast cancer awareness, early detection, and personalized risk assessment. The platform leverages advanced machine learning models, AI-powered chatbots, and interactive quizzes to empower users with reliable information and tools to take control of their breast health.

## Features
- **AI Chatbot:** An intelligent digital health assistant that provides medically reliable answers to breast cancer-related questions, powered by advanced language models.
- **Risk Assessment Quiz:** A personalized quiz that evaluates individual risk factors based on family history, lifestyle, and other health indicators using AI-driven analysis.
- **Scan Assessment:** Upload mammogram or ultrasound images for AI-assisted analysis to support early detection efforts.
- **Comprehensive Backend API:** Flask-based RESTful API handling scan processing, risk assessment, and chatbot interactions.
- **User Data Management:** Secure storage of scan results and user information in a SQLite database.

## Technologies Used
- **Backend:** Python, Flask, SQLite, Roboflow API for ML inference, Google Gemini and Groq LLM APIs for AI-powered features.
- **Frontend:** Next.js, React, Tailwind CSS, Lucide React icons.
- **Machine Learning:** Roboflow model for breast cancer scan analysis.
- **AI Services:** Google Gemini and Groq APIs for chatbot and risk assessment quiz.

## Installation and Setup

### Backend
1. Clone the repository.
2. Install Python dependencies (Flask, sqlite3, google-generativeai, groq, inference_sdk, etc.).
3. Set environment variables for API keys:
   - `ROBOFLOW` for Roboflow API key.
   - `GROQ_API_KEY` for Groq API.
   - `GEMINI_API_KEY` for Google Gemini API.
4. Initialize the database by running the backend (the app will auto-create the SQLite DB).
5. Start the Flask server:
   ```bash
   python app.py
   ```

### Frontend
1. Navigate to the `frontend` directory.
2. Install dependencies using npm or yarn:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```
4. Access the frontend at `http://localhost:3000`.

## Usage
- Use the web interface to:
  - Chat with the AI assistant for breast cancer information.
  - Take the risk assessment quiz to evaluate your personal risk.
  - Upload scans for AI-assisted analysis.
- The backend API endpoints:
  - `POST /api/check_scan` - Submit scan images and user info for analysis.
  - `POST /api/risk-assessment` - Submit quiz conversation data for risk evaluation.
  - `POST /api/chat` - Send messages to the AI chatbot.

## Contributing
Contributions are welcome! Please fork the repository and submit pull requests for improvements or bug fixes.

## License
This project is licensed under the MIT License.

## Contact
For questions or support, please contact the project maintainer.

---

*Her's is dedicated to supporting breast cancer awareness and early detection through innovative technology.*
