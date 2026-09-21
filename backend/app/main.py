from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, HTMLResponse
import io
from PIL import Image
from app.models.gradcam import GradCAMModel

# Initialize FastAPI application with title, description, and metadata
app = FastAPI(
    title="Med Vision Inspector API",
    description="Backend service for biomedical image analysis and AI explainability heatmaps (PyTorch & Grad-CAM). "
                "Frontend Web App (Angular): https://vision-inspector.pages.dev",
    version="1.0.0"
)

# Enable CORS for Angular frontend development and production connection, exposing custom headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://vision-inspector.pages.dev",
        "http://localhost:4200",
        "http://localhost:3000"
    ],  # Allowed origins configured for production frontend and local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Model-Confidence"]  # Expose custom confidence header to the frontend client
)

# Initialize the PyTorch Grad-CAM model pipeline on startup
ai_model = GradCAMModel()

@app.get("/", response_class=HTMLResponse)
def read_root():
    """
    Root health check endpoint.
    Returns a styled HTML landing page with service status and a direct link to the frontend application.
    """
    html_content = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Med Vision Inspector API</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background-color: #0f172a;
                color: #f8fafc;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            .card {
                background-color: #1e293b;
                border: 1px solid #334155;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
                text-align: center;
                max-width: 480px;
                width: 100%;
            }
            .status-badge {
                display: inline-block;
                background-color: rgba(34, 197, 94, 0.15);
                color: #4ade80;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 600;
                margin-bottom: 20px;
            }
            h1 {
                font-size: 1.5rem;
                margin-bottom: 10px;
                color: #f1f5f9;
            }
            p {
                color: #94a3b8;
                font-size: 0.95rem;
                line-height: 1.5;
                margin-bottom: 30px;
            }
            .btn {
                display: inline-block;
                background-color: #38bdf8;
                color: #0f172a;
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: 600;
                text-decoration: none;
                transition: background-color 0.2s, box-shadow 0.2s;
            }
            .btn:hover {
                background-color: #0ea5e9;
                box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="status-badge">● System Online</div>
            <h1>Med Vision Inspector API</h1>
            <p>The backend inference pipeline is up and running successfully. Access the user interface through the official web application.</p>
            <a class="btn" href="https://vision-inspector.pages.dev" target="_blank">Open Frontend Web App</a>
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.post("/api/v1/inspect")
async def inspect_image(file: UploadFile = File(...)):
    """
    Receives an uploaded medical/biomedical image, 
    processes it through the PyTorch Grad-CAM explainability pipeline,
    and returns the processed image with visual attention overlays and confidence score.
    Connected Frontend: https://vision-inspector.pages.dev
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image.")

    try:
        # Read image file contents into memory
        contents = await file.read()
        image_pil = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Generate real Grad-CAM heatmap and prediction confidence using PyTorch model
        result_image, confidence = ai_model.generate_heatmap(image_pil)
        
        # Save processed image into memory buffer as JPEG
        output_buffer = io.BytesIO()
        result_image.save(output_buffer, format="JPEG")
        output_buffer.seek(0)
        
        # Return binary image stream via Response, including confidence score in custom header
        return Response(
            content=output_buffer.getvalue(), 
            media_type="image/jpeg",
            headers={
                "X-Model-Confidence": str(confidence),
                "Access-Control-Expose-Headers": "X-Model-Confidence"
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image through AI pipeline: {str(e)}")