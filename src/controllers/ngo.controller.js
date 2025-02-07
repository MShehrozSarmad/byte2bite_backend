import { Contribution } from "../models/contribution.model.js";
import { Notification } from "../models/notification.model.js";
import { ContributionService } from "../services/contribution.service.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const makeRequest = asyncHandler(async (req, res) => {
    const { foodItem, pickupTime } = req.body;
    const user = req.user;

    if (!foodItem || !pickupTime)
        throw new ApiError(400, "foodItem and pickupTime is required");

    await ContributionService.createContribution(foodItem, pickupTime, user);

    res.status(200).json(
        new ApiResponse(200, null, "reservaion request sent successfully")
    );
});

// const cont_stts_collecting = asyncHandler(async (req, res) => {
//     const { requestId, pickupTime } = req.body;

//     if (!requestId || !pickupTime)
//         throw new ApiError(
//             400,
//             "Missing required fields: requestId and pickupTime"
//         );

//     const updatedReq = await Contribution.findByIdAndUpdate(
//         requestId,
//         { pickupTime, status: "collecting" },
//         { new: true }
//     );
//     if (!updatedReq) throw new ApiError(404, "Request not found");

//     await Notification.create({
//         recipient: updatedReq.contributor,
//         type: "status update",
//         contribution: updatedReq._id,
//         message: "Your food is now being collected.",
//     });

//     res.status(200).json(
//         new ApiResponse(200, null, "status updated successfully")
//     );
// });



const updateStatusNGO = asyncHandler(async (req, res) => {
    const { contribution, status } = req.body;
    const user = req.user;

    const allowedStatus = ["collecting", "collected", "distributing", "donated", "cancelled"];

    if (!status || !contribution)
        throw new ApiError(400, "contribution and status is required");

    if (!allowedStatus.includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    await ContributionService.updateStatus(contribution, status, user);

    res.status(200).json(
        new ApiResponse(200, null, "status updated successfully")
    );
});

export { makeRequest, updateStatusNGO};
