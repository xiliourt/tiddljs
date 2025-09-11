import { z } from 'zod';

export const TrackQualitySchema = z.enum(['LOW', 'HIGH', 'LOSSLESS', 'HI_RES_LOSSLESS']);
export type TrackQuality = z.infer<typeof TrackQualitySchema>;

export const TrackArgSchema = z.enum(['low', 'normal', 'high', 'master']);
export type TrackArg = z.infer<typeof TrackArgSchema>;

export const SinglesFilterSchema = z.enum(['none', 'only', 'include']);
export type SinglesFilter = z.infer<typeof SinglesFilterSchema>;

export const ARG_TO_QUALITY: Record<TrackArg, TrackQuality> = {
    low: 'LOW',
    normal: 'HIGH',
    high: 'LOSSLESS',
    master: 'HI_RES_LOSSLESS',
};

export const QUALITY_TO_ARG: Record<TrackQuality, TrackArg> = {
    LOW: 'low',
    HIGH: 'normal',
    LOSSLESS: 'high',
    HI_RES_LOSSLESS: 'master',
};
