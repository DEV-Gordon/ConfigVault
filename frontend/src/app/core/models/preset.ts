export interface Preset {}

import { Setting } from './setting';

export type TierLabel = 'Bronze' | 'Silver' | 'Gold' | 'Steam Deck';
export type DeckVerification = 'Unknown' | 'Verified' | 'Playable' | 'Unverified' | 'Unplayable';

export interface Preset {
    
    tier: number;
    tier_label: TierLabel;
    deckVerification: DeckVerification;
    notes: string;
    config_file?: string | null;
    settings: Setting[];

}