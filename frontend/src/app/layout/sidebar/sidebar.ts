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
      this.router.navigate([], {
        relativeTo: this.route.root,
        queryParams: {
          preset_section: section,
        },
        // Keep other query params untouched (for example, api_target).
        queryParamsHandling: 'merge',
      });
    }
  }

  setApiSection(section: string): void {
    // Clicking the active item toggles that filter off.
    if (this.apiSection === section) {
      this.clearApiSection();
    } else {
      this.router.navigate([], {
        relativeTo: this.route.root,
        queryParams: {
          api_target: section,
        },
        // Keep other query params untouched (for example, preset_section).
        queryParamsHandling: 'merge',
      });
    }
  }

  private clearPresetSection(): void {
    // Setting a query param to null removes it from the URL.
    this.router.navigate([], {
      relativeTo: this.route.root,
      queryParams: {
        preset_section: null,
      },
      queryParamsHandling: 'merge',
    });
  }

  private clearApiSection(): void {
    // Setting a query param to null removes it from the URL.
    this.router.navigate([], {
      relativeTo: this.route.root,
      queryParams: {
        api_target: null,
      },
      queryParamsHandling: 'merge',
    });
  }
}