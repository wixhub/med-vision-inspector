import torch
import torchvision.models as models
import torchvision.transforms as transforms
import numpy as np
import cv2
from PIL import Image

class GradCAMModel:
    """
    Grad-CAM (Gradient-weighted Class Activation Mapping) wrapper for PyTorch models.
    Designed for biomedical image explainability within the Med Vision Inspector platform.
    Frontend Web App: https://vision-inspector.pages.dev
    Backend Service: https://med-vision-inspector.onrender.com/
    """
    def __init__(self):
        # Set up device (GPU if available, otherwise CPU)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Load a pre-trained ResNet50 model (can be swapped for medical-specific weights)
        self.model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        self.model.eval()
        self.model.to(self.device)
        
        self.gradient = None
        self.activation = None
        
        # Register hooks to extract feature maps and gradients from the target convolutional layer
        self._register_hooks()

    def _register_hooks(self):
        """Register forward and backward hooks on the last convolutional layer (layer4)."""
        def forward_hook(module, input, output):
            self.activation = output

        def backward_hook(module, grad_input, grad_output):
            self.gradient = grad_output[0]

        # Target layer for ResNet50: last block of layer4
        target_layer = self.model.layer4[-1]
        target_layer.register_forward_hook(forward_hook)
        target_layer.register_full_backward_hook(backward_hook)

    def preprocess(self, image: Image.Image) -> torch.Tensor:
        """Preprocess PIL image into normalized tensor matching model requirements."""
        preprocess_pipeline = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406], 
                std=[0.229, 0.224, 0.225]
            ),
        ])
        return preprocess_pipeline(image).unsqueeze(0).to(self.device)

    def generate_heatmap(self, image: Image.Image):
        """
        Generates a Grad-CAM attention heatmap overlay for the given image.
        Returns:
            Tuple containing the processed PIL Image with heatmap and the confidence score.
        """
        original_size = image.size  # (width, height)
        input_tensor = self.preprocess(image)

        # Forward pass through the model
        output = self.model(input_tensor)
        class_idx = output.argmax(dim=1).item()

        # Backward pass to compute gradients for the predicted class
        self.model.zero_grad()
        class_score = output[0, class_idx]
        class_score.backward()

        # Extract gradients and activations
        gradients = self.gradient.cpu().data.numpy()[0]
        activations = self.activation.cpu().data.numpy()[0]

        # Pool gradients across spatial dimensions
        weights = np.mean(gradients, axis=(1, 2))
        cam = np.zeros(activations.shape[1:], dtype=float)

        # Weight the activation maps
        for i, w in enumerate(weights):
            cam += w * activations[i]

        # Apply ReLU to keep only positive contributions
        cam = np.maximum(cam, 0)
        
        # Resize CAM to match original image dimensions
        cam = cv2.resize(cam, original_size)
        
        # Normalize heatmap values between 0 and 1
        if cam.max() > 0:
            cam = cam / cam.max()

        # Apply Jet colormap to create visual heatmap
        heatmap = cv2.applyColorMap(np.uint8(255 * cam), cv2.COLORMAP_JET)
        heatmap = cv2.cvtColor(heatmap, cv2.COLOR_BGR2RGB)
        
        # Superimpose heatmap onto the original image
        original_np = np.array(image.convert("RGB"))
        superimposed = cv2.addWeighted(original_np, 0.6, heatmap, 0.4, 0)

        # Calculate prediction confidence
        confidence = float(output.softmax(dim=1)[0, class_idx].item())

        return Image.fromarray(superimposed), confidence