import { Contribution } from "../models/contribution.model.js";
import { FoodItem } from "../models/foodItem.model.js";
import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/apiError.js";
import { sendEmail } from "../services/nodemailer.service.js";
import fs from "fs";
import path from "path";

export const ContributionService = {
    async createContribution(foodItem, pickupTime, user) {
        const foodItemRes = await FoodItem.findById(foodItem);

        if (!foodItemRes || foodItemRes.status !== "available") {
            throw new ApiError(400, "Food item not available");
        }

        await foodItemRes.populate({
            path: "contributor",
            select: "details.basicInfo.name email",
        });

        const contributorName =
            foodItemRes.contributor?.details?.basicInfo?.name;
        const contributorEmail = foodItemRes.contributor?.email;

        const contribution = await Contribution.create({
            foodItem: foodItemRes._id,
            contributor: foodItemRes.contributor,
            ngo: user._id,
            pickupTime,
        });

        const msg = `An NGO ${user.details.basicInfo.name} sent a food reservation request for food item ${foodItemRes.name}`;

        await Notification.create({
            recipient: foodItemRes.contributor,
            type: "request",
            contribution: contribution._id,
            message: msg,
        });

        const templatePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "contribution_status_update.html"
        );
        let html = fs.readFileSync(templatePath, "utf-8");
        html = html.replace(
            /{{name}}/g,
            contributorName || contributorEmail.split("@")[0]
        );
        html = html.replace(/{{contributionId}}/g, contribution._id);
        html = html.replace(/{{status}}/g, "Pending");
        html = html.replace(/{{message}}/g, msg);

        await sendEmail(contributorEmail, "Food Reservation Request", html);

        return contribution;
    },

    async updateStatus(contributionId, newStatus, user) {
        const contribution = await Contribution.findOne({
            _id: contributionId,
            $or: [{ contributor: user._id }, { ngo: user._id }],
        })
            .populate({
                path: "contributor",
                select: "details.basicInfo.name email",
            })
            .populate({
                path: "ngo",
                select: "details.basicInfo.name email",
            });

        if (!contribution) {
            throw new ApiError(403, "item not found");
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

        const rcpntEmail =
            user.role == "ngo"
                ? contribution.contributor.email
                : contribution.ngo.email;

        const rcpntName =
            user.role == "ngo"
                ? contribution.contributor.details.basicInfo.name
                : contribution.ngo.details.basicInfo.name;

        const templatePath = path.join(
            process.cwd(),
            "src",
            "templates",
            "contribution_status_update.html"
        );
        let html = fs.readFileSync(templatePath, "utf-8");
        html = html.replace(/{{name}}/g, rcpntName);
        html = html.replace(/{{contributionId}}/g, contribution._id);
        html = html.replace(/{{status}}/g, newStatus);
        html = html.replace(/{{message}}/g, message);

        await sendEmail(rcpntEmail, "Contribution Status Update", html);

        return resp;
    },
};
