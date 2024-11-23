import createHttpError from "http-errors";
import eventSchema from "../validator/eventSchema.js";
import { Event } from "../model/event.model.js";
import uploadOnCloudinary from "../services/cloudinary.js";

const eventController = {
  async create(req, res, next) {
    const userId = req.user.id;
    const { error } = eventSchema.validate(req.body);
    if (error) return next(createHttpError(400, error.message)); // Use 400 for validation errors

    const { name, description, eventDate } = req.body;

    try {
      // Check if an event with the same name or description already exists
      const existingEvent = await Event.findOne({
        $or: [{ name }, { description }],
      });
      if (existingEvent) {
        return next(
          createHttpError(
            409,
            "Event with this name or description already exists"
          )
        );
      }

      let imageUrl;
      // If an image is uploaded, upload to Cloudinary
      if (req.files && req.files.image && req.files.image[0]) {
        const imageFile = req.files.image[0];
        imageUrl = await uploadOnCloudinary(imageFile.buffer);
      }

      // Create a new event instance
      const newEvent = new Event({
        name,
        description,
        eventDate,
        organizer: userId,
        image: imageUrl,
      });

      const savedEvent = await newEvent.save();

      res.status(201).json({
        message: "Event created successfully!",
        event: savedEvent,
      });
    } catch (err) {
      next(createHttpError(500, err.message)); // Handle internal server errors
    }
  },
  async getAllEvents(req, res, next) {
    try {
      const events = await Event.find()
        .populate("organizer", "name email _id image") // Populate organizer details
        .select("-__v"); // Exclude the __v field

      res.status(200).json(events);
    } catch (err) {
      next(createHttpError(500, "Failed to fetch events"));
    }
  },
  // Participate in an event
  async participateEvent(req, res, next) {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return next(createHttpError(404, "Event not found"));
      }

      // Check if user is already a participant
      if (event.participants.includes(userId)) {
        return next(createHttpError(400, "User already participating"));
      }

      // Add user to participants
      event.participants.push(userId);
      await event.save();

      res
        .status(200)
        .json({ message: "Successfully participated in the event" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Depart from an event
  async departEvent(req, res, next) {
    const { eventId } = req.params;
    const userId = req.user.id;

    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return next(createHttpError(404, "Event not found"));
      }

      // Check if user is not a participant
      if (!event.participants.includes(userId)) {
        return next(
          createHttpError(400, "User not participating in the event")
        );
      }

      // Remove user from participants
      event.participants = event.participants.filter(
        (participant) => participant.toString() !== userId
      );
      await event.save();

      res.status(200).json({ message: "Successfully departed from the event" });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Fetch all participants for a specific event
  async getParticipants(req, res, next) {
    const { eventId } = req.params;

    try {
      const event = await Event.findById(eventId).populate(
        "participants",
        "name email image acadamics"
      );
      if (!event) {
        return next(createHttpError(404, "Event not found"));
      }

      res.status(200).json({ participants: event.participants });
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },

  // Fetch single event details
  async getEventById(req, res, next) {
    const { eventId } = req.params;

    try {
      const event = await Event.findById(eventId)
        .populate("organizer", "name email image")
        .select("-__v");
      if (!event) {
        return next(createHttpError(404, "Event not found"));
      }

      res.status(200).json(event);
    } catch (err) {
      next(createHttpError(500, err.message));
    }
  },
};

export default eventController;
