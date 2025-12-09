import Counter from "../models/counterModel.js";

 

export async function generateRef(counterId) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  // return the raw number (e.g. 1, 2, 3)
  return counter.seq;
}