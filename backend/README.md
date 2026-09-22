# Med Vision Inspector — Backend ⚗️🔬

The inference and processing server for the **Med Vision Inspector** platform. Built with **Python**, **PyTorch**, and **FastAPI**, it handles deep learning model loading (ResNet18), Grad-CAM attention map generation, and image preprocessing.

## Key Features

- **FastAPI REST API:** High-performance asynchronous endpoints for receiving biomedical scans and returning processed attention heatmaps along with model confidence scores.
- **PyTorch & Grad-CAM Pipeline:** Extracts spatial attention features from target convolutional layers to explain neural network predictions visually.
- **CORS & Middleware Support:** Configured for seamless communication with the Angular frontend client.

## Tech Stack

- **Framework:** FastAPI, Uvicorn
- **Deep Learning:** PyTorch, Torchvision
- **Image Processing:** Pillow (PIL), NumPy, OpenCV (optional)

## Project Structure (`backend/`)

```text
backend/
├── app/
│   ├── api/           # API routes (endpoints for image upload and inference)
│   ├── core/          # Application configurations and settings
│   └── models/        # PyTorch model architecture and Grad-CAM logic
├── Dockerfile         # Container configuration for the backend service
└── requirements.txt   # Python dependencies
```

## Setup & Local Development

1. Create and activate a virtual environment:

```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the development server:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Once running, you can access the interactive API documentation (Swagger UI) at:
http://localhost:8000/docs

## Docker Deployment

To build and run the backend inside a Docker container:

```bash
docker build -t med-vision-backend .
docker run -p 8000:8000 med-vision-backend
```
