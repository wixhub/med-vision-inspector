export interface InferenceResponse {
  status: string;
  message?: string;
}

export interface InspectorState {
  selectedFile: File | null;
  fileName: string;
  previewUrl: string | null;
  resultImageUrl: string | null;
  isLoading: boolean;
  errorMessage: string | null;
  confidence: number | null; // Model confidence score (0 to 1)
}
