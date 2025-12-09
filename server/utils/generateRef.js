import Counter from "../models/counterModel.js";

 

export async function generateRef(prefix = "X", counterId) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  const number = counter.seq.toString().padStart(2, "0");
  return `${prefix}-${number}`;
}
