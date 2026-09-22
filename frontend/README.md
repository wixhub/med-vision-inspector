# Med Vision Inspector — Frontend ⚗️🔬

The client-side single-page application for the **Med Vision Inspector** platform. Built with **Angular** (utilizing reactive Signals), **TypeScript**, and **HTML5 Canvas**, it provides a clinical-grade interface for biomedical image inspection and visual AI explanation (Grad-CAM).

## Key Features & Architecture

- **Reactive State Management:** Driven by Angular Signals for predictable, real-time UI synchronization across components.

- **Dynamic Image Source Attribution:** Automatic detection and labeling of active data sources, toggling between public-domain references (Wikimedia Commons CC BY-SA 4.0) for default scans and custom local uploads.

- **Interaction Locking:** Disables user input and interaction (`pointer-events: none` and loading overlays) during active asynchronous backend inference.

- **Robust Component Testing:** Fully covered by **Vitest** unit tests mocking services, asynchronous `FileReader` workflows, and API responses.

## Project Structure (`src/app/`)

```text
src/app/
├── core/
│   ├── models/            # TypeScript interfaces and type definitions (e.g., InspectorState)
│   └── services/          # Communication services with FastAPI backend (InspectorService)
└── features/
    ├── inspector/         # Main container component managing pipeline logic & state
    ├── sidebar/           # Control panel, attribution display, and action buttons
    └── image-canvas/      # Canvas rendering pipeline for original scans and attention heatmaps
```

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.6.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
