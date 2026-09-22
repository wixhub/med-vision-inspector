## 🚀 TODO & Future Roadmap

Here are planned features and architectural enhancements to scale **Med Vision Inspector** into a production-ready enterprise diagnostic tool:

- [ ] **Advanced XAI Enhancements:** Implement integrated gradients and SHAP (SHapley Additive exPlanations) alongside Grad-CAM for multi-method model interpretability cross-validation.

- [ ] **3D Medical Imaging Support:** Extend the canvas and backend pipeline to handle volumetric DICOM datasets (MRI/CT scans) with multi-planar reconstruction (axial, sagittal, coronal views).

- [ ] **Client-Side Web Workers:** Offload heavy image preprocessing and data normalization tasks to Web Workers to ensure a strictly non-blocking UI thread.

- [ ] **End-to-End Testing (E2E):** Integrate Playwright or Cypress for robust automated E2E test suites covering user upload flows, canvas interaction, and backend communication.

- [ ] **Multi-Model Architecture Switcher:** Allow users to dynamically switch between different torchvision backbones (e.g., EfficientNet, DenseNet, ResNet50) directly from the sidebar.

- [ ] **Secure DICOM Anonymization:** Add client-side metadata stripping (removal of Patient PHI tags) prior to file transmission or local processing.
