const Listing = require("../Models/listing.js");
const Reservation = require("../Models/reservation.js");
const expressError = require("../utils/expressError.js");

module.exports.renderBookingForm = async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("owner");

  if (!listing) {
    throw new expressError(404, "Listing not found");
  }

  res.render("book.ejs", { listing });
};

module.exports.createReservation = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests = 1 } = req.body.reservation;

  // Make sure the reservation is tied to a real listing.
  const listing = await Listing.findById(id);
  if (!listing) {
    throw new expressError(404, "Listing not found");
  }

  // Convert incoming date strings from the form into Date objects.
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const timeDiff = checkOutDate.getTime() - checkInDate.getTime();
  const totalNights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
    throw new expressError(400, "Please provide valid reservation dates");
  }

  if (totalNights < 1) {
    throw new expressError(400, "Check-out date must be after check-in date");
  }

  // Reject the booking when the same listing already has a live reservation
  // whose stay window overlaps the requested dates.
  const overlappingReservation = await Reservation.findOne({
    listing: listing._id,
    status: { $ne: "cancelled" },
    checkIn: { $lt: checkOutDate },
    checkOut: { $gt: checkInDate },
  });

  if (overlappingReservation) {
    req.flash("error", "Those dates are already booked for this listing");
    return res.redirect(`/listings/${listing._id}/reservations/book`);
  }

  // Save pricing-related fields on the server so the client cannot fake them.
  const reservation = new Reservation({
    listing: listing._id,
    guest: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: Number(guests),
    totalNights,
    totalPrice: listing.price * totalNights,
  });

  await reservation.save();
  req.flash("success", "Reservation created successfully");
  res.redirect(`/reservations/${reservation._id}/confirmation`);
};

module.exports.getUserReservations = async (req, res) => {
  // Show the logged-in user only their own reservation history.
  const reservations = await Reservation.find({ guest: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  // Filter out any broken references so the bookings page stays stable.
  const activeReservations = reservations.filter((reservation) => reservation.listing);

  res.render("myReservations.ejs", { reservations: activeReservations });
};

module.exports.showReservation = async (req, res) => {
  // Populate related data so the confirmation/details page has listing and guest info.
  const reservation = await Reservation.findById(req.params.reservationId)
    .populate("listing")
    .populate("guest");

  if (!reservation) {
    throw new expressError(404, "Reservation not found");
  }

  if (!reservation.listing) {
    await Reservation.findByIdAndDelete(reservation._id);
    req.flash("error", "This reservation was removed because its listing no longer exists");
    return res.redirect("/reservations/my");
  }

  // Prevent users from viewing someone else's reservation details.
  if (!reservation.guest._id.equals(req.user._id)) {
    throw new expressError(403, "You are not allowed to view this reservation");
  }

  res.render("confirmation.ejs", { reservation });
};
