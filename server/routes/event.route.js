import { router } from "./index.js";
import authMiddleware from "../middlewares/auth.js";
import eventController from "../controllers/event.controller.js";
import { upload } from "../middlewares/multer.js";

const eventRouter = router;

// Route for creating a new event
eventRouter.post(
  "/create/event",
  [
    upload.fields([
      {
        name: "image", // Field for uploading event image
        maxCount: 1,
      },
    ]),
    authMiddleware, // Ensure only authenticated users can create events
  ],
  eventController.create
);

// Route for fetching all events
eventRouter.get("/all/list", eventController.getAllEvents);

// Route for participating in an event
eventRouter.post(
  "/participate/:eventId",
  authMiddleware,
  eventController.participateEvent
);

// Route for departing from an event
eventRouter.delete(
  "/depart/:eventId",
  authMiddleware,
  eventController.departEvent
);

// Route for fetching all participants of a particular event
eventRouter.get(
  "/participants/:eventId",
  authMiddleware,
  eventController.getParticipants
);

// Route for fetching a single event detail
eventRouter.get(
  "/event/:eventId",
  authMiddleware,
  eventController.getEventById
);

export default eventRouter;
