import { Contribution } from "../models/contribution.model.js";
import { FoodItem } from "../models/foodItem.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";

export const ContributionService = {
    async createContribution(foodItem, pickupTime, user) {
        const foodItemRes = await FoodItem.findById(foodItem);

        if (foodItemRes.status !== "available" || !foodItemRes) {
            throw new ApiError(400, "Food item not available");
        }

        const contribution = Contribution.create({
            foodItem: foodItemRes._id,
            contributor: foodItemRes.contributor,
            ngo: user._id,
            pickupTime,
        });

        await Notification.create({
            recipient: foodItemRes.contributor,
            type: "request",
            contribution: contribution._id,
            message: `An NGO ${user.details.basicInfo.name} sent a food reservation request`,
        });

        return contribution;
    },

    async updateStatus(contributionId, newStatus, user) {
        const contribution = await Contribution.findOne({
            _id: contributionId,
            $or: [{ contributor: user._id }, { ngo: user._id }],
            // for authorization, only owner contributor or ngo can make changes
        });

        if (!contribution) {
            throw new ApiError(403, "Unauthorized or not found");
        }

        const allowedTransitions = {
            pending: ["accepted", "rejected"],
            accepted: ["collecting", "cancelled"],
            collecting: ["collected", "cancelled"],
            collected: ["distributing", "cancelled"],
            distributing: ["donated"],
            donated: [],
            rejected: [],
            cancelled: [],
        };
        if (!allowedTransitions[contribution.status].includes(newStatus)) {
            throw new ApiError(
                400,
                `Invalid status transition: ${contribution.status} → ${newStatus}`
            );
        }

        contribution.status = newStatus;
        const resp = await contribution.save();

        const statusMessages = {
            accepted:
                "Your reservation request has been accepted. Please prepare to pickup on time.",
            rejected:
                "Your reservation request has been rejected. Contact the contributor for more details.",
            collecting: "Your contribution is being collected, be prepared.",
            collected:
                "Your contribution has been collected and is on its way to the NGO.",
            distributing:
                "Your contribution is being distributed to beneficiaries.",
            donated:
                "Your contribution has been successfully donated. Thank you for your generosity!",
            cancelled: "The contribution has been cancelled.",
        };

        const message =
            statusMessages[newStatus] ||
            "There is an update regarding your contribution.";

        await Notification.create({
            recipient:
                user.role == "ngo"
                    ? contribution.contributor
                    : contribution.ngo,
            type: "status update",
            contribution: contribution._id,
            message,
        });

        return resp;
    },
};
