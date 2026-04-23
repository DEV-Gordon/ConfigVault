import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Preset } from '../../../core/models/preset';

@Component({
  selector: 'app-preset-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './preset-card.html',
  styleUrl: './preset-card.css',
})
export class PresetCard {
  @Input({ required: true }) preset!: Preset;

  getDeckBadgeClass(value: string | undefined): string {
    const normalized = (value ?? '').toLowerCase();
    if (normalized === 'verified') return 'bg-[rgba(46,164,79,0.18)] text-[#8df0ae] border-[rgba(46,164,79,0.45)]';
    if (normalized === 'playable') return 'bg-[rgba(164,132,46,0.18)] text-[#ffe59a] border-[rgba(164,132,46,0.45)]';
    if (normalized === 'unplayable') return 'bg-[rgba(164,46,63,0.18)] text-[#ffc1cb] border-[rgba(164,46,63,0.45)]';
    return 'bg-[rgba(102,192,244,0.12)] text-[#b8dcf5] border-[rgba(102,192,244,0.25)]';
  }
}
