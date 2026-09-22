import { Component, inject, signal, OnInit } from '@angular/core';
import { InspectorService } from '../../core/services/inspector.service';
import { InspectorState } from '../../core/models/inspector.model';
import { ImageCanvas } from '../image-canvas/image-canvas';
import { Sidebar } from '../sidebar/sidebar';

@Component({
  imports: [ImageCanvas, Sidebar],
  selector: 'app-inspector',
  styleUrl: './inspector.scss',
  templateUrl: './inspector.html',
})
export class Inspector implements OnInit {
  private readonly inspectorService = inject(InspectorService);

  // Reactive component state managed via Angular Signals
  public readonly state = signal<InspectorState>({
    selectedFile: null,
    fileName: '',
    previewUrl: null,
    resultImageUrl: null,
    isLoading: false,
    errorMessage: null,
    confidence: null,
  });

  /**
   * Lifecycle hook: automatically load the default Wikimedia T1 Brain MRI demo scan on startup.
   */
  public ngOnInit(): void {
    this.loadDefaultDemoImage();
  }

  /**
   * Fetches the local public-domain Brain MRI sample for instant academic demonstration.
   */
  private async loadDefaultDemoImage(): Promise<void> {
    const demoImageUrl = 'img/MRI_Brain_T1_Sag_(9).jpg';

    try {
      this.state.update((curr) => ({ ...curr, isLoading: true }));
      const response = await fetch(demoImageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'MRI_Brain_T1_Sag_(9).jpg', { type: 'image/jpeg' });

      const reader = new FileReader();
      reader.onload = () => {
        this.state.update((curr) => ({
          ...curr,
          selectedFile: file,
          fileName: '', // Оставляем пустым, чтобы боковая панель показала академическую ссылку на Wikimedia
          previewUrl: reader.result as string,
          isLoading: false,
        }));

        // Automatically trigger AI inference pipeline for instant demo feedback
        this.processImage();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.warn('Failed to load default demo asset:', error);
      this.state.update((curr) => ({ ...curr, isLoading: false }));
    }
  }

  /**
   * Handles local user file selections through the dropzone input.
   */
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.state.update((curr) => ({
          ...curr,
          selectedFile: file,
          fileName: file.name, // При пользовательском файле здесь появится имя файла
          previewUrl: reader.result as string,
          resultImageUrl: null,
          errorMessage: null,
          confidence: null,
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Triggers the backend AI inference pipeline and updates heatmap states.
   */
  public processImage(): void {
    const file = this.state().selectedFile;
    if (!file) return;

    this.state.update((curr) => ({ ...curr, isLoading: true, errorMessage: null }));

    this.inspectorService.inspectImage(file).subscribe({
      next: ({ blob, confidence }) => {
        const objectUrl = URL.createObjectURL(blob);
        this.state.update((curr) => ({
          ...curr,
          resultImageUrl: objectUrl,
          confidence: confidence,
          isLoading: false,
        }));
      },
      error: (err) => {
        console.error('Backend inference pipeline error:', err);
        this.state.update((curr) => ({
          ...curr,
          errorMessage: 'Failed to process image through backend inference pipeline.',
          isLoading: false,
        }));
      },
    });
  }
}
