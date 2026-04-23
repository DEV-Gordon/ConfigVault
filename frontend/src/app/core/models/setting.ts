export interface Setting {}

export type ImpactLevel = '' | 'Low' | 'Medium' | 'High';

export interface Setting {
    
    id: number;
    key: string;
    value: string;
    impact: ImpactLevel;
}