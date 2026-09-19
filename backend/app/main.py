from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import io
from PIL import Image

app = FastAPI(
    title="Med Vision Inspector API",
    description="Backend service for biomedical image analysis and AI explainability heatmaps.",
    version="1.0.0"
)

# Enable CORS for Angular frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    """Root health check endpoint."""
    return {"status": "online", "service": "Med Vision Inspector API"}

@app.post("/api/v1/inspect")
async def inspect_image(file: UploadFile = File(...)):
    """
    Receives an uploaded medical/biomedical image, 
    processes it through an explainability pipeline (simulated Grad-CAM heatmap),
    and returns the processed image with visual overlays.
    """
    try:
        # Read image file contents into memory
        contents = await file.read()
        image_pil = Image.open(io.BytesIO(contents)).convert("RGB")
        image_np = np.array(image_pil)
        
        # Convert RGB to BGR for OpenCV processing
        image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        height, width, _ = image_bgr.shape

        # Generate a simulated attention heatmap (Grad-CAM style simulation for demo)
        # In a real research app, this would be inference output from a PyTorch model.
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        # Create a synthetic region of interest (attention mask) based on image gradients
        heatmap = cv2.Laplacian(gray, cv2.CV_32F)
        heatmap = cv2.normalize(heatmap, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
        heatmap = np.uint8(heatmap)
        
        # Apply colormap (JET or COLORMAP_TURBO) to create the scientific heatmap overlay
        colored_heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        # Blend original image with the heatmap
        superimposed = cv2.addWeighted(image_bgr, 0.6, colored_heatmap, 0.4, 0)
        
        # Encode result back to JPEG format
        success, encoded_image = cv2.imencode(".jpg", superimposed)
        if not success:
            raise HTTPException(status_code=500, status_message="Image encoding failed.")
            
        # Return image bytes or base64 (here returning binary stream via Response)
        from fastapi.responses import Response
        return Response(content=encoded_image.tobytes(), media_type="image/jpeg")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")