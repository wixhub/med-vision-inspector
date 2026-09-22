import { Component, input, output } from '@angular/core';
import { InspectorState } from '../../core/models/inspector.model';
import { DecimalPipe } from '@angular/common';

@Component({
  imports: [DecimalPipe],
  selector: 'app-sidebar',
  styleUrl: './sidebar.scss',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  // Input signal representing the parent component's state
  public readonly state = input.required<InspectorState>();

  // Output event emitters for actions
  public readonly fileSelected = output<Event>();
  public readonly processImage = output<void>();

  /**
   * Handles native file input change event and propagates it upwards.
   */
  public onFileSelected(event: Event): void {
    this.fileSelected.emit(event);
  }
}
