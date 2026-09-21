from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import io
from PIL import Image
from app.models.gradcam import GradCAMModel

app = FastAPI(
    title="Med Vision Inspector API",
    description="Backend service for biomedical image analysis and AI explainability heatmaps (PyTorch & Grad-CAM). "
                "Frontend Web App (Angular): https://vision-inspector.pages.dev",
    version="1.0.0"
)

# Enable CORS for Angular frontend development and production connection
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
)

# Initialize the PyTorch Grad-CAM model pipeline on startup
ai_model = GradCAMModel()

@app.get("/")
def read_root():
    """
    Root health check endpoint.
    Returns service status and metadata linking to the frontend application.
    """
    return {
        "status": "online",
        "service": "Med Vision Inspector API",
        "backend_url": "https://med-vision-inspector.onrender.com/",
        "frontend_url": "https://vision-inspector.pages.dev"
    }

@app.post("/api/v1/inspect")
async def inspect_image(file: UploadFile = File(...)):
    """
    Receives an uploaded medical/biomedical image, 
    processes it through the PyTorch Grad-CAM explainability pipeline,
    and returns the processed image with visual attention overlays.
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