import type { RegionInput } from '../types/region.type.js';
import { createRegion, existRegionByCode } from '../repositories/region.repository.js';
import { CustomError, ErrorCodes } from '../errors/customError.js';

export const addRegion = async (regionInput: RegionInput) => {
    
    const existionRegion : boolean = await existRegionByCode(regionInput.region_code);
    if(existionRegion) {
        throw new CustomError(400, ErrorCodes.RESOURCE_ALREADY_EXISTS, '이미 존재하는 지역 코드입니다.');
    }
    return await createRegion(
        regionInput.sido,
        regionInput.sigungu,
        regionInput.eubmyeonli,
        regionInput.region_code
    );;
}