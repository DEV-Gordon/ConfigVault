import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})

export class Sidebar {
  protected activePresetSection = 'trending';
  protected activeApiSection = 'dx12';

  setPresetSection(section: string): void {
    this.activePresetSection = section;
  }

  setApiSection(section: string): void {
    this.activeApiSection = section;
  }

}
