
// src/controllers/qrconfig.controller.ts
import { Request, Response } from 'express';
import { QRConfigService } from '@/services/qrconfig.service';
import { catchAsync, sendResponse, ParamsUtil } from '@/utils';

export class QRConfigController {
    private qrConfigService: QRConfigService;

    constructor() {
        this.qrConfigService = new QRConfigService();
    }

    getQRConfig = catchAsync(async (req: Request, res: Response) => {
        const restaurantId = ParamsUtil.getString(req.params.restaurantId) || req.user?.restaurantId;

        if (!restaurantId) {
            sendResponse(res, 400, {
                message: 'Restaurant ID is required',
            });
            return;
        }

        const config = await this.qrConfigService.getQRConfig(restaurantId);

        sendResponse(res, 200, {
            message: config ? 'QR Config retrieved successfully' : 'No QR Config found, using defaults',
            data: config,
        });
    });

    createOrUpdateQRConfig = catchAsync(async (req: Request, res: Response) => {
        const restaurantId = ParamsUtil.getString(req.params.restaurantId) || req.user?.restaurantId;

        if (!restaurantId) {
            sendResponse(res, 400, {
                message: 'Restaurant ID is required',
            });
            return;
        }

        const config = await this.qrConfigService.createOrUpdateQRConfig(restaurantId, req.body);

        sendResponse(res, 200, {
            message: 'QR Config saved successfully',
            data: config,
        });
    });

    deleteQRConfig = catchAsync(async (req: Request, res: Response) => {
        const restaurantId = ParamsUtil.getString(req.params.restaurantId) || req.user?.restaurantId;

        if (!restaurantId) {
            sendResponse(res, 400, {
                message: 'Restaurant ID is required',
            });
            return;
        }

        const config = await this.qrConfigService.deleteQRConfig(restaurantId);

        sendResponse(res, 200, {
            message: 'QR Config deleted successfully',
            data: config,
        });
    });

    resetQRConfig = catchAsync(async (req: Request, res: Response) => {
        const restaurantId = ParamsUtil.getString(req.params.restaurantId) || req.user?.restaurantId;

        if (!restaurantId) {
            sendResponse(res, 400, {
                message: 'Restaurant ID is required',
            });
            return;
        }

        const config = await this.qrConfigService.resetQRConfig(restaurantId);

        sendResponse(res, 200, {
            message: 'QR Config reset to defaults successfully',
            data: config,
        });
    });
}