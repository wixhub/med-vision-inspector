# Med Vision Inspector ⚗️🔬

An interactive scientific web application designed for the inspection, processing, and visual explanation of biomedical and medical imaging data. Built as part of a research portfolio bridging computer vision, model interpretability (Explainable AI), and high-performance frontend architectures.

## Key Features

- **Visual AI Explanation:** Overlays model attention masks and heatmaps (Grad-CAM style) directly onto medical images to interpret neural network decisions.
- **High-Performance Rendering:** Utilizes HTML5 Canvas and WebGL pipelines for smooth real-time manipulation, zooming, and threshold adjustments of high-resolution imagery.
- **Modern Frontend Architecture:** Developed using Angular (Signals) within an enterprise-grade standalone structure, ensuring reactive, predictable state management.
- **Client-Server Synergy:** Lightweight Python/PyTorch inference backend coupled with a modular TypeScript/Angular frontend.

## Tech Stack

- **Frontend:** Angular, Signals, TypeScript, HTML5 Canvas, Tailwind CSS
- **Backend & AI:** Python, PyTorch, FastAPI / REST API
- **Tooling:** Vite, Nx Workspace, Docker

```text
med-vision-inspector/
├── backend/ # Python / PyTorch / FastAPI (AI model & image processing)
│ ├── app/
│ │ ├── api/ # Routes (endpoints for image upload and inference)
│ │ ├── core/ # Configurations and settings
│ │ └── models/ # PyTorch model loading and Grad-CAM / heatmap logic
│ ├── Dockerfile
│ └── requirements.txt
├── frontend/ # Angular (Signals) + TypeScript + Canvas
│ ├── src/
│ │ ├── app/
│ │ │ ├── components/ # UI components (image inspector, control panel)
│ │ │ ├── services/ # Services for communicating with the FastAPI backend
│ │ │ └── workers/ # Web Workers (optional for heavy client-side computations)
│ │ └── index.html
│ ├── package.json
│ └── angular.json
├── docker-compose.yml # For running both parts together with a single command
└── README.md
```
