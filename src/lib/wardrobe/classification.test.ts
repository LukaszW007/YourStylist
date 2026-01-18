
import { describe, it, expect } from 'vitest';
import { computeComfortRange } from './classification';

describe('computeComfortRange', () => {
    // 1. Single material tests based on the table
    it('returns correct range for Cotton', () => {
        expect(computeComfortRange(['Cotton'])).toMatchObject({ min: 15, max: 25 });
    });

    it('returns correct range for Wool', () => {
        expect(computeComfortRange(['Wool'])).toMatchObject({ min: -5, max: 15 });
    });

    it('returns correct range for Linen', () => {
        expect(computeComfortRange(['Linen'])).toMatchObject({ min: 22, max: 35 });
    });
    
    it('returns correct range for Faux Fur (special characters)', () => {
        expect(computeComfortRange(['Faux Fur'])).toMatchObject({ min: -15, max: 5 });
    });

    // 2. Case insensitivity check
    it('handles case insensitivity', () => {
        expect(computeComfortRange(['cotton'])).toMatchObject({ min: 15, max: 25 });
        expect(computeComfortRange(['COTTON'])).toMatchObject({ min: 15, max: 25 });
    });

    // 3. Mixed materials (averaging)
    it('averages ranges for mixed materials (Cotton + Polyester)', () => {
        // Cotton: 15-25
        // Polyester: 15-22
        // Avg Min: (15+15)/2 = 15
        // Avg Max: (25+22)/2 = 23.5 -> 24 (round)
        expect(computeComfortRange(['Cotton', 'Polyester'])).toMatchObject({ min: 15, max: 24 });
    });

    it('averages ranges for mixed materials (Wool + Silk)', () => {
        // Wool: -5 to 15
        // Silk: 15 to 30
        // Avg Min: (-5 + 15)/2 = 5
        // Avg Max: (15 + 30)/2 = 22.5 -> 23
        expect(computeComfortRange(['Wool', 'Silk'])).toMatchObject({ min: 5, max: 23 });
    });

    // 4. Unknown materials / Fallback
    it('uses default range for unknown material', () => {
        expect(computeComfortRange(['Unobtainium'])).toMatchObject({ min: 15, max: 25 });
    });

    it('handles empty input', () => {
         expect(computeComfortRange([])).toMatchObject({ min: 15, max: 25 });
    });
    
    it('assigns correct thermal profile for Cold', () => {
         // Angora: -15 to 10. Mid: -2.5. < 5 => Insulated
         const result = computeComfortRange(['Angora']);
         expect(result.thermalProfile).toBe('Insulated');
    });
    
    it('assigns correct thermal profile for Hot', () => {
         // Linen: 22 to 35. Mid: 28.5. >= 28 => Ultra-Light
         const result = computeComfortRange(['Linen']);
         expect(result.thermalProfile).toBe('Ultra-Light');
    });

    // 5. CLO value tests (new functionality)
    it('returns estimatedClo for Cotton (~0.18)', () => {
         const result = computeComfortRange(['Cotton']);
         expect(result.estimatedClo).toBeCloseTo(0.18, 2);
    });

    it('returns higher estimatedClo for Wool (~0.45)', () => {
         const result = computeComfortRange(['Wool']);
         expect(result.estimatedClo).toBeCloseTo(0.45, 2);
    });

    it('averages CLO for mixed materials', () => {
         // Cotton: 0.18, Wool: 0.45 => avg = 0.315
         const result = computeComfortRange(['Cotton', 'Wool']);
         expect(result.estimatedClo).toBeCloseTo(0.315, 2);
    });
});
