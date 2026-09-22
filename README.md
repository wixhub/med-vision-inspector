# Med Vision Inspector ⚗️🔬

An interactive scientific web application designed for the inspection, processing, and visual explanation of biomedical and medical imaging data. Built as part of a research portfolio bridging computer vision, model interpretability (Explainable AI), and high-performance frontend architectures.

## Key Features

- **Visual AI Explanation:** Overlays model attention masks and heatmaps (Grad-CAM style) directly onto medical images to interpret neural network decisions.

- **High-Performance Rendering:** Utilizes HTML5 Canvas and WebGL pipelines for smooth real-time manipulation, zooming, and threshold adjustments of high-resolution imagery.

- **Modern Frontend Architecture:** Developed using Angular (Signals) within an enterprise-grade standalone structure, ensuring reactive, predictable state management.

- **Client-Server Synergy:** Lightweight Python/PyTorch inference backend coupled with a modular TypeScript/Angular frontend.

## Tech Stack

- **Frontend:** Angular, Signals, TypeScript, HTML5 Canvas
- **Backend & AI:** Python, PyTorch, FastAPI / REST API
- **Tooling:** Docker, Vite

```text
med-vision-inspector/
├── backend/               # Python / PyTorch / FastAPI (AI model & image processing)
│   ├── app/
│   │ ├── api/             # Routes (endpoints for image upload and inference)
│   │ ├── core/            # Configurations and settings
│   │ └── models/          # PyTorch model loading and Grad-CAM / heatmap logic
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # Angular (Signals) + TypeScript + Canvas
│   ├── src/
│   │ ├── app/
│   │ │ ├── features/      # UI components (image inspector, control panel)
│   │ │ └── core/          # Services for communicating with the FastAPI backend
│   │ │     └── workers/   # Web Workers (optional for heavy client-side computations)
│   │ └── styles.scss
│   ├── package.json
│   └── angular.json
├── docker-compose.yml     # For running both parts together with a single command
└── README.md
```

## Running the Project

Docker Compose (Recommended):

```bash
docker-compose up --build
```

## Manual Frontend Testing (Vitest):

```bash
cd frontend
npm install
npm run test
```

## Licensing & Attribution

- **Default Demo Asset:** The default T1-weighted Brain MRI scan used for instant demonstration is sourced from **Wikimedia Commons** and licensed under the **Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)** license. Proper academic attribution and links are dynamically rendered in the UI when the default asset is active.

- **Custom Uploads:** User-provided biomedical scans remain local and private to the client session, tagged as non-attribution custom local uploads.

- **Project License:** This project is open-source and available under the terms specified in the [LICENSE](LICENSE) file.

_Research & Development in Explainable Artificial Intelligence (XAI) & Computer Vision for Medical Diagnostics_
