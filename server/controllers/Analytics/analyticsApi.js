import affotaxAnalytics from "../../models/affotaxAnalytics.js";

// Store click or impression data
export const storeEvent = async (req, res) => {
  try {
    const { pageUrl, eventType } = req.body;

    if (!pageUrl || !eventType) {
      return res
        .status(400)
        .json({ message: "pageUrl and eventType are required" });
    }

    const newEvent = new affotaxAnalytics({
      pageUrl,
      eventType,
    });

    await newEvent.save();

    res
      .status(201)
      .json({ message: "Event recorded successfully", data: newEvent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error storing event", error: error.message });
  }
};

export const getAllEvents = async (req, res) => {
  try {
    const { pageUrl, eventType } = req.query;

    const filter = {};
    if (pageUrl) filter.pageUrl = pageUrl;
    if (eventType) filter.eventType = eventType;

    const events = await Analytics.find(filter).sort({ timestamp: -1 });

    res
      .status(200)
      .json({ message: "Events fetched successfully", data: events });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching events", error: error.message });
  }
};
