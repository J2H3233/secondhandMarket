import type { Request, Response, NextFunction } from "express";
import type { CreateRegionRequestBody } from "../types/region.type.js";
import { addRegion } from "../services/region.services.js";

export const handlerCreateRegion = async (req: Request<{}, {}, CreateRegionRequestBody>, res: Response, next: NextFunction) : Promise<void> => {
    const { sido, sigungu, eubmyeonli, region_code } = req.body;
    try {
        const region = await addRegion({ sido, sigungu, eubmyeonli, region_code });
        res.jsonSuccess(region, '지역 생성에 성공했습니다.', 201);
    } catch (error) {
        next(error);
    }
};