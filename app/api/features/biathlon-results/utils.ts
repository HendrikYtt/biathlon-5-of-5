import {CompetitorResponse} from '@/app/api/features/biathlon-results/types';

export type EquipmentType =
    'Pers.Sponsor' |
    'Skis' |
    'Rifle' |
    'Ammunition' |
    'Race Suit' |
    'Shoes/Boots' |
    'Bindings' |
    'Ski Poles'

export const getEquipment = (competitorResp: CompetitorResponse, equipmentType: EquipmentType) => {
	const equipment = competitorResp.Equipment.find(e => e.Description === equipmentType);
	return equipment.Value;
};
