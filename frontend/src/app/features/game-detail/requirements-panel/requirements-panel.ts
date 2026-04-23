import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { SafeHtmlPipe } from '../../../shared/pipes/safe-html-pipe';

type RequirementsValue = Record<string, any> | null | undefined;

@Component({
  selector: 'app-requirements-panel',
  standalone: true,
  imports: [CommonModule, SafeHtmlPipe],
  templateUrl: './requirements-panel.html',
  styleUrl: './requirements-panel.css',
})
export class RequirementsPanel {
  @Input() requirements: RequirementsValue;

  get minimumHtml(): string {
    return this.requirements?.['pc']?.['minimum'] ?? '';
  }

  get recommendedHtml(): string {
    return this.requirements?.['pc']?.['recommended'] ?? '';
  }

  get hasAnyData(): boolean {
    return Boolean(this.minimumHtml || this.recommendedHtml);
  }
}
