const express = require("express");
const listingReservationRouter = express.Router({ mergeParams: true });
const reservationRouter = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");
const { loggedIn } = require("../middleware.js");
const {
  renderBookingForm,
  createReservation,
  getUserReservations,
  showReservation,
} = require("../controller/reservations.js");

// Nested route: show a themed booking page for a specific listing.
listingReservationRouter.get("/book", loggedIn, wrapAsync(renderBookingForm));

// Nested route: create a reservation for a specific listing.
listingReservationRouter.post("/", loggedIn, wrapAsync(createReservation));

// Top-level route: fetch all reservations belonging to the current user.
reservationRouter.get("/my", loggedIn, wrapAsync(getUserReservations));

// Top-level route: show the reservation confirmation page.
reservationRouter.get("/:reservationId/confirmation", loggedIn, wrapAsync(showReservation));

module.exports = { listingReservationRouter, reservationRouter };
