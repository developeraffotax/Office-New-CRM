import mongoose from "mongoose";

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
    
    status: { 
      type: String,
    },

    progressStatus: {
      type: String,
      enum: ["pending", "in_progress", "completed"],
      default: "in_progress",

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
    subscription: {
      type: String,
      default: "",
    },
    note: {
      type: String,
      default: "",
    },
    job: jobSchema,
    data: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lable",
    },


    completedAt: { type: Date },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    progressedAt: { type: Date },
    progressedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    source: {
      type: String,
      // enum: ["FIV", "UPW", "PPH", "Website", "Direct", "Partner", ]
    },



    // source: {
    //   type: String,
    //   enum: ["Upwork", "Fiverr", "PPH", "Referral", "Partner", "Google", "Facebook", "LinkedIn", "CRM", "Existing", "Other",]
    // },
  },
  { timestamps: true }
);




subScriptionSchema.index({ progressStatus: 1, subscription: 1 }) 



export default mongoose.model("Subscription", subScriptionSchema);
