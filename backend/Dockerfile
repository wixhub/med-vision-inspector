# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Set working directory inside the container
WORKDIR /app

# Install system dependencies required for OpenCV (updated for modern Debian)
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download PyTorch ResNet50 weights during the build phase 
# to prevent runtime timeouts and 502 Bad Gateway errors on Render
RUN python -c "import torchvision.models as models; models.resnet50(weights=models.ResNet50_Weights.DEFAULT)"

# Copy the rest of the backend application code
COPY . .

# Expose the port FastAPI runs on
EXPOSE 8000

# Command to run the application using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]