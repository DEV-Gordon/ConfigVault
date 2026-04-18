export interface Setting {}

export type ImpactLevel = 'low' | 'medium' | 'high';

export interface Setting {
    
    id: number;
    key: string;
    value: string;
    impact: ImpactLevel;
}