import { Contribution } from "../models/contribution.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

const makeRequest = asyncHandler(async (req, res) => {
    const { foodItem, contributor } = req.body;

    if (!foodItem || !contributor)
        throw new ApiError(
            400,
            "Missing required fields: foodItem, contributor"
        );

    const ngo = req.user._id;

    const ngoReqItem = await Contribution.create({
        foodItem,
        contributor,
        ngo,
    });

    if (!ngoReqItem) throw new ApiError(503, "Error creating request");

    const notification = await Notification.create({
        recipient: contributor,
        type: "request",
        contribution: ngoReqItem._id,
        message: "An NGO sent a food reservation request",
    });
    if (!notification) throw new ApiError(503, "Error creating notification");

    res.status(200).json(
        new ApiResponse(200, null, "reservation request successful")
    );
});

const cont_stts_collecting = asyncHandler(async (req, res) => {
    const { requestId, pickupTime } = req.body;

    if (!requestId || !pickupTime)
        throw new ApiError(
            400,
            "Missing required fields: requestId and pickupTime"
        );

    const updatedReq = await Contribution.findByIdAndUpdate(
        requestId,
        { pickupTime, status: "collecting" },
        { new: true }
    );
    if (!updatedReq) throw new ApiError(404, "Request not found");

    await Notification.create({
        recipient: updatedReq.contributor,
        type: "status update",
        contribution: updatedReq._id,
        message: "Your food is now being collected.",
    });

    res.status(200).json(
        new ApiResponse(200, null, "status updated successfully")
    );
});

// const 

export { makeRequest, cont_stts_collecting };
