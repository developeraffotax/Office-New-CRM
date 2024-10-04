import mongoose from "mongoose";

const labelSchema = new mongoose.Schema({
  name: { type: String },
  color: { type: String },
});

const jobSchema = new mongoose.Schema({
  jobName: {
    type: String,
  },
  billingStart: {
    type: Date,
    default: () => new Date(),
  },
  billingEnd: {
    type: Date,
    default: () => new Date(),
  },
  deadline: {
    type: Date,
    default: () => new Date(),
  },
  hours: {
    type: String,
  },
  fee: {
    type: String,
  },
  jobStatus: {
    type: String,
  },
  notes: {
    type: String,
  },
  subscription: {
    type: String,
  },
  lead: {
    type: String,
  },
  jobHolder: {
    type: String,
  },
});

const subScriptionSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    regNumber: {
      type: String,
    },
    companyName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    totalHours: {
      type: String,
    },
    currentDate: {
      type: Date,
      default: () => new Date(),
    },
    source: {
      type: String,
    },
    status: {
      type: String,
    },
    clientType: {
      type: String,
    },
    partner: {
      type: String,
    },
    country: {
      type: String,
    },
    fee: {
      type: String,
    },
    ctLogin: {
      type: String,
    },
    ctPassword: {
      type: String,
    },
    pyeLogin: {
      type: String,
    },
    pyePassword: {
      type: String,
    },
    trLogin: {
      type: String,
    },
    trPassword: {
      type: String,
    },
    vatLogin: {
      type: String,
    },
    vatPassword: {
      type: String,
    },
    authCode: {
      type: String,
    },
    utr: {
      type: String,
    },
    job: jobSchema,
    label: labelSchema,
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subScriptionSchema);
