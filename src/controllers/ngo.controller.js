import { Contribution } from "../models/contribution.model.js";
import { FoodItem } from "../models/foodItem.model.js";
import { Notification } from "../models/notification.model.js";
import { ContributionService } from "../services/contribution.service.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import haversine from "haversine-distance";

const makeRequest = asyncHandler(async (req, res) => {
    const { foodItem, pickupTime } = req.body;
    const user = req.user;

    if (!foodItem || !pickupTime)
        throw new ApiError(400, "foodItem and pickupTime is required");

    const contribution = await ContributionService.createContribution(
        foodItem,
        pickupTime,
        user
    );

    res.status(200).json(
        new ApiResponse(
            200,
            contribution,
            "reservaion request sent successfully"
        )
    );
});

const availableFoodItems = asyncHandler(async (req, res) => {
    const food = await FoodItem.find({ status: "available" });

    if (food.length === 0) throw new ApiError(404, "no food is listed");

    // Get NGO coordinates
    const ngoCoords = req.user.details.address.coordinates;
    if (
        !ngoCoords ||
        ngoCoords.latitude == null ||
        ngoCoords.longitude == null
    ) {
        throw new ApiError(400, "NGO coordinates not found");
    }

    // Calculate distance for each food item
    const foodWithDistance = food.map((item) => {
        const foodCoords = item.location;
        const distance = haversine(
            { lat: ngoCoords.latitude, lon: ngoCoords.longitude },
            { lat: foodCoords.latitude, lon: foodCoords.longitude }
        );
        return { ...item.toObject(), distance };
    });

    // Sort by distance (nearest first)
    foodWithDistance.sort((a, b) => a.distance - b.distance);

    res.status(200).json(
        new ApiResponse(
            200,
            foodWithDistance,
            "food items data fetched successfully"
        )
    );
});

const updateStatusNGO = asyncHandler(async (req, res) => {
    const { contribution, status } = req.body;
    const user = req.user;

    const allowedStatus = [
        "collecting",
        "collected",
        "distributing",
        "donated",
        "cancelled",
    ];

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

const activeContributions = asyncHandler(async (req, res) => {
    const user = req.user;
    const { status } = req.query;

    const allowedStatus = [
        "pending",
        "accepted",
        "rejected",
        "collecting",
        "collected",
        "distributing",
        "donated",
        "cancelled",
    ];
    const filter = { ngo: user._id };

    if (status) {
        if (!allowedStatus.includes(status)) {
            throw new ApiError(404, "invalid status value");
        } else {
            filter.status = status;
        }
    } else {
        filter.status = { $in: allowedStatus };
    }

    const reservations = await Contribution.find(filter)
        .populate({
            path: "foodItem",
        })
        .populate({
            path: "contributor",
            select: "-password -refreshToken",
        });

    if (!reservations || reservations.length === 0) {
        throw new ApiError(404, "No active contribution found");
    }

    res.status(200).json(
        new ApiResponse(
            200,
            reservations,
            "contributions data fetched successfully"
        )
    );
});

export {
    makeRequest,
    updateStatusNGO,
    availableFoodItems,
    activeContributions,
};
