import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-database',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="animate-fade-in">
      <h2 class="text-lg sm:text-xl font-light text-white uppercase tracking-[0.16em] mb-5">Database</h2>
      <div class="bg-black/20 border border-[rgba(42,71,94,0.35)] rounded-sm p-5 text-steam-muted text-[14px]">
        Full database filters and browsing view will be added in the next iteration.
      </div>
    </section>
  `,
})
export class Database {}
