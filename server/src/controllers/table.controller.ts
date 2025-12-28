// src/controllers/table.controller.ts
import { Request, Response } from 'express';
import { TableService } from '@/services/table.service';
import { catchAsync, sendResponse } from '@/utils';
import QRCode from 'qrcode';

export class TableController {
  private tableService: TableService;

  constructor() {
    this.tableService = new TableService();
  }

  createTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const branchId = req.params.branchId || req.body.branchId;

    if (!restaurantId || !branchId) {
      sendResponse(res, 400, {
        message: 'Restaurant ID and Branch ID are required',
      });
      return;
    }

    const table = await this.tableService.createTable(restaurantId, branchId, req.body);

    sendResponse(res, 201, {
      message: 'Table created successfully',
      data: table,
    });
  });

  getTable = catchAsync(async (req: Request, res: Response) => {
    const table = await this.tableService.getTable(req.params.id);

    sendResponse(res, 200, {
      message: 'Table retrieved successfully',
      data: table,
    });
  });

  getTableByQrCode = catchAsync(async (req: Request, res: Response) => {
    const { qrCode } = req.params;
    const table = await this.tableService.getTableByQrCode(qrCode);

    sendResponse(res, 200, {
      message: 'Table retrieved successfully',
      data: table,
    });
  });

  getTablesByBranch = catchAsync(async (req: Request, res: Response) => {
    const { branchId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = req.query.status ? { status: req.query.status } : {};

    const result = await this.tableService.getTablesByBranch(branchId, page, limit, filter);

    sendResponse(res, 200, {
      message: 'Tables retrieved successfully',
      data: result,
    });
  });

  getTablesByRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const filter = req.query.status ? { status: req.query.status } : {};

    const result = await this.tableService.getTablesByRestaurant(
      restaurantId!,
      page,
      limit,
      filter
    );

    sendResponse(res, 200, {
      message: 'Tables retrieved successfully',
      data: result,
    });
  });

  updateTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const table = await this.tableService.updateTable(req.params.id, restaurantId!, req.body);

    sendResponse(res, 200, {
      message: 'Table updated successfully',
      data: table,
    });
  });

  updateTableStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;

    if (!status) {
      sendResponse(res, 400, {
        message: 'Status is required',
      });
      return;
    }

    const table = await this.tableService.updateTableStatus(req.params.id, status);

    sendResponse(res, 200, {
      message: 'Table status updated successfully',
      data: table,
    });
  });

  deleteTable = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const table = await this.tableService.deleteTable(req.params.id, restaurantId!);

    sendResponse(res, 200, {
      message: 'Table deleted successfully',
      data: table,
    });
  });

  regenerateQrCode = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const table = await this.tableService.regenerateQrCode(req.params.id, restaurantId!);

    sendResponse(res, 200, {
      message: 'QR code regenerated successfully',
      data: table,
    });
  });

  getQrCodeData = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const qrUrl = await this.tableService.getQrCodeData(req.params.id, restaurantId!);

    sendResponse(res, 200, {
      message: 'QR code data retrieved successfully',
      data: {
        qrUrl,
        // Frontend can use this URL to generate QR code image using libraries like qrcode.js
        // Or backend can generate image if needed
      },
    });
  });

  // this will generate qr code image in the backend
  generateQrCodeImage = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.params.restaurantId || req.user?.restaurantId;
    const qrUrl = await this.tableService.getQrCodeData(req.params.id, restaurantId!);

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(qrUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      width: 300,
      margin: 2,
    });

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="table-qr-${req.params.id}.png"`);

    // Send image
    res.send(qrCodeBuffer);
  });
}
