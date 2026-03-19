import express from "express";

import {
  applyForDonation,
  createDonationPost,
  deleteDonationPost,
  getAllDonationPosts,
  getIncomingDonationApplications,
  getOutgoingDonationApplications,
  reactToDonationPost,
  updateDonationApplicationStatus,
} from "../controllers/donation.controller.js";
import { checkAuth } from "../middlewares/auth.middleware.js";
import uploadFactory from "../middlewares/uploadFactory.js";

const donationRouter = express.Router();
const uploadDonationImage = uploadFactory("donation-images");

donationRouter.post(
  "/",
  checkAuth,
  uploadDonationImage.single("image"),
  createDonationPost
);

donationRouter.delete("/:id", checkAuth, deleteDonationPost);

donationRouter.get(
  "/",
  checkAuth,
  getAllDonationPosts
);

donationRouter.post(
  "/apply",
  checkAuth,
  applyForDonation
);

donationRouter.post(
  "/:id/react",
  checkAuth,
  reactToDonationPost
);

donationRouter.get(
  "/incoming-applications",
  checkAuth,
  getIncomingDonationApplications
);


donationRouter.get(
  "/outgoing-applications",
  checkAuth,
  getOutgoingDonationApplications
);

donationRouter.patch(
  "/application/status",
  checkAuth,
  updateDonationApplicationStatus
);

export default donationRouter;
