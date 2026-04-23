import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})

export class Sidebar {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  protected presetSection: string | null = null;
  protected apiSection: string | null = null;

  constructor() {
    // Keep sidebar state in sync with URL query params.
    this.route.root.queryParams.subscribe(params => {
      this.presetSection = params['preset_section'] || null;
      this.apiSection = params['api_target'] || null;
    });
  }

  setPresetSection(section: string): void {
    // Clicking the active item toggles that filter off.
    if (this.presetSection === section) {
      this.clearPresetSection();
    } else {
      this.navigateToDiscover(section, this.apiSection);
    }
  }

  setApiSection(section: string): void {
    // Clicking the active item toggles that filter off.
    if (this.apiSection === section) {
      this.clearApiSection();
    } else {
      this.navigateToDiscover(this.presetSection, section);
    }
  }

  private clearPresetSection(): void {
    this.navigateToDiscover(null, this.apiSection);
  }

  private clearApiSection(): void {
    this.navigateToDiscover(this.presetSection, null);
  }

  private navigateToDiscover(presetSection: string | null, apiSection: string | null): void {
    const queryParams: Record<string, string> = {};
    if (presetSection) {
      queryParams['preset_section'] = presetSection;
    }
    if (apiSection) {
      queryParams['api_target'] = apiSection;
    }

    this.router.navigate(['/discover'], { queryParams });
  }
}