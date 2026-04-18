import { Engine } from './engine';
import { Preset } from './preset';

export interface SystemRequirements {

    pc?: {
        minimum: string;
        recommended: string;
    };
}

export type ApiTarget = 
    | 'DX7' | 'DX8' | 'DX9' | 'DX10' | 'DX11' | 'DX12'
    | 'GL' | 'GLES' | 'VK' | 'MTL' | 'WEBGL' | 'OTHER';

export interface Game {
    steam_appid: number;
    engine: Engine | null;
    api_target: ApiTarget | string;
    title: string;
    developer: string;
    description: string;
    release_date: string;
    url_header?: string;
    url_capsule?: string;
    url_background?: string;
    requirements?: SystemRequirements | Record<string, any>;
    presets: Preset[];
}

