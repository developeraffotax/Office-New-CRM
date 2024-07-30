import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CgClose } from "react-icons/cg";
import { GrFormNext } from "react-icons/gr";
import { GrFormPrevious } from "react-icons/gr";
import { style } from "../../utlis/CommonStyle";

const jobs = [
  "Book Keeping",
  "Payroll",
  "VAT Return",
  "Accounts",
  "Personal Tax",
  "Company Sec",
  "Address",
  "Subscription",
];

export default function AddJobModal({ setIsOpen }) {
  const [step, setStep] = useState(1);
  const [isloading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [address, setAddress] = useState("");
  const [jobName, setJobName] = useState("");
  const [jobData, setJobData] = useState(
    jobs.reduce((acc, job) => {
      acc[job] = {
        checked: false,
        yearEnd: "",
        deadline: "",
        workDeadline: "",
        HRS: "",
        FEE: "",
        lead: "",
        jobHolderName: "",
      };
      return acc;
    }, {})
  );

  const handleNextStep = () => {
    setStep((prevStep) => Math.min(prevStep + 1, 3));
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => Math.max(prevStep - 1, 1));
  };

  const partners = ["Affotax", "Outsource", "OTL"];
  const sources = ["AIV", "UPW", "PPH", "Website", "Referal", "Partner"];
  const clients = ["Limited", "LLP", "Individual", "Non UK"];
  const leads = ["Rashid", "Salman", "M Ali"];
  const JobHolders = ["Rashid", "Salman", "M Ali"];

  //   Add Job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
      setIsLoading(false);
    }
  };

  //   Get Currect Date
  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Set the current date when the component mounts
  useEffect(() => {
    const date = getCurrentDate();
    setCurrentDate(date);
  }, []);

  //   Select Job
  const handleChange = (job, field, value) => {
    setJobName(job);
    setJobData((prevData) => ({
      ...prevData,
      [job]: {
        ...prevData[job],
        [field]: value,
      },
    }));
  };

  return (
    <div className="relative w-[45rem] py-3 px-3 sm:px-4 bg-white rounded-lg">
      <span
        className="absolute top-3 right-3 cursor-pointer z-10 p-1 rounded-lg bg-white/50 hover:bg-white/70 transition-all duration-150 flex items-center justify-center"
        onClick={() => setIsOpen(false)}
      >
        <CgClose className="h-5 w-5 text-black" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-semibold text-black">Add New Client</h1>
        <div className="flex items-center gap-2 m-auto">
          <button
            onClick={() => setStep(1)}
            className={`flex  items-center gap-1 font-medium text-[.8rem] ${
              step === 1 || step === 2 || step === 3
                ? "text-orange-600"
                : "text-gray-600"
            }`}
          >
            <span
              className={`border-2 ${
                step === 1 || step === 2 || step === 3
                  ? "border-orange-600"
                  : "border-gray-400"
              } w-[.7rem] h-[.7rem] rounded-full`}
            ></span>
            Step (1)
          </button>
          <span
            className={`w-[6rem] h-[3px] rounded-[2rem] ${
              step === 2 || step === 3 ? " bg-orange-600" : "bg-gray-400"
            } `}
          ></span>
          <button
            onClick={() => setStep(2)}
            className={`flex  items-center gap-1 font-medium text-[.8rem] ${
              step === 2 || step === 3 ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <span
              className={`border-2 ${
                step === 2 || step === 3
                  ? "border-orange-600"
                  : "border-gray-400"
              } w-[.7rem] h-[.7rem] rounded-full`}
            ></span>
            Step (2)
          </button>
          <span
            className={`w-[6rem] h-[3px] rounded-[2rem] ${
              step === 3 ? " bg-orange-600" : "bg-gray-400"
            } `}
          ></span>
          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-1 font-medium text-[.8rem] ${
              step === 3 ? "text-orange-600" : "text-gray-600"
            }`}
          >
            <span
              className={`border-2 ${
                step === 3 ? "border-orange-600" : "border-gray-400"
              } w-[.7rem] h-[.7rem] rounded-full`}
            ></span>
            Step (3)
          </button>
        </div>

        <div className="mt-3">
          <form onSubmit={handleSubmit}>
            <>
              {step === 1 ? (
                <div className=" flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="text"
                      placeholder="Client Name"
                      className={`${style.input}`}
                    />
                    <input
                      type="text"
                      placeholder="Company Name"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <select className={`${style.input}`}>
                      <option value="">Partner</option>
                      {partners?.map((p, i) => (
                        <option value={p} key={i}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <select className={`${style.input}`}>
                      <option value="">Source</option>
                      {sources?.map((s, i) => (
                        <option value={s} key={i}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="email"
                      placeholder="Email Address"
                      className={`${style.input}`}
                    />
                    <select className={`${style.input}`}>
                      <option value="">Client Type</option>
                      {clients?.map((c, i) => (
                        <option value={c} key={i}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="text"
                      placeholder="Total Hours"
                      className={`${style.input}`}
                    />
                    <input
                      type="number"
                      placeholder="Hourly Rate"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="date"
                      placeholder="Current Date"
                      value={currentDate}
                      onChange={(e) => setCurrentDate(e.target.value)}
                      className={`${style.input}`}
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      className={`${style.input}`}
                    />
                  </div>
                </div>
              ) : step === 2 ? (
                <div className=" flex flex-col gap-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="text"
                      placeholder="Auth Code"
                      className={`${style.input}`}
                    />
                    <input
                      type="text"
                      placeholder="TR Login"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="text"
                      placeholder="UTR"
                      className={`${style.input}`}
                    />
                    <input
                      type="text"
                      placeholder="VAT Login"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="test"
                      placeholder="PAYE Login"
                      className={`${style.input}`}
                    />
                    <input
                      type="test"
                      placeholder="CT Login"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ">
                    <input
                      type="text"
                      placeholder="Company Number"
                      className={`${style.input}`}
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      className={`${style.input}`}
                    />
                  </div>
                  <div className="w-full ">
                    <input
                      type="text"
                      placeholder="Address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`${style.input} w-full`}
                    />
                  </div>
                </div>
              ) : (
                <div className="max-h-[24rem] overflow-y-scroll message">
                  {jobs.map((job) => (
                    <div key={job} className="mb-4 ">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={jobData[job].checked}
                          onChange={(e) =>
                            handleChange(job, "checked", e.target.checked)
                          }
                        />
                        <span className="font-medium">{job}</span>
                      </label>
                      {jobData[job].checked && job === jobName && (
                        <div className="mt-2 space-y-2 flex flex-col gap-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full">
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                Year End
                              </span>
                              <input
                                type="date"
                                placeholder="Year End"
                                value={jobData[job].yearEnd}
                                onChange={(e) =>
                                  handleChange(job, "yearEnd", e.target.value)
                                }
                                className={`${style.input} w-full`}
                              />
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                Deadline
                              </span>
                              <input
                                type="date"
                                placeholder="Deadline"
                                value={jobData[job].deadline}
                                onChange={(e) =>
                                  handleChange(job, "deadline", e.target.value)
                                }
                                className={`${style.input} w-full`}
                              />
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                Work Deadline
                              </span>
                              <input
                                type="date"
                                placeholder="Work Deadline"
                                value={jobData[job].workDeadline}
                                onChange={(e) =>
                                  handleChange(
                                    job,
                                    "workDeadline",
                                    e.target.value
                                  )
                                }
                                className={`${style.input} w-full`}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                HRS
                              </span>
                              <input
                                type="text"
                                placeholder="HRS"
                                value={jobData[job].HRS}
                                onChange={(e) =>
                                  handleChange(job, "HRS", e.target.value)
                                }
                                className={`${style.input} w-full`}
                              />
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                FEE
                              </span>
                              <input
                                type="text"
                                placeholder="FEE"
                                value={jobData[job].FEE}
                                onChange={(e) =>
                                  handleChange(job, "FEE", e.target.value)
                                }
                                className={`${style.input} w-full`}
                              />
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                Lead
                              </span>
                              <select
                                value={jobData[job].lead}
                                onChange={(e) =>
                                  handleChange(job, "lead", e.target.value)
                                }
                                className={`${style.input} w-full h-[2.7rem]`}
                              >
                                <option value="">Select Lead</option>
                                {leads.map((lead) => (
                                  <option key={lead} value={lead}>
                                    {lead}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="flex flex-col gap-[1px]">
                              <span className="text-gray-500 text-[.9rem]">
                                Job Placeholder
                              </span>
                              <select
                                value={jobData[job].JobHolders}
                                onChange={(e) =>
                                  handleChange(
                                    job,
                                    "jobHolderName",
                                    e.target.value
                                  )
                                }
                                className={`${style.input} w-full h-[2.7rem]`}
                              >
                                <option value=""> Job Placeholder</option>
                                {JobHolders.map((jh) => (
                                  <option key={jh} value={jh}>
                                    {jh}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
            {/* Buttons */}
            <div className="flex justify-between mt-4">
              <span
                onClick={handlePreviousStep}
                disabled={step === 1}
                className={`px-4 py-[.4rem] cursor-pointer rounded text-[.9rem] flex items-center gap-0 ${
                  step === 1 ? "bg-gray-300" : "bg-orange-600 text-white"
                }`}
              >
                <GrFormPrevious className="h-5 w-5 text-white" /> Prev
              </span>
              {step === 3 ? (
                <button
                  onClick={handleNextStep}
                  type="submit"
                  className={`px-4 py-[.4rem] cursor-pointer rounded text-[.9rem] flex items-center gap-0 ${"bg-orange-600 text-white"}`}
                >
                  Save & Close
                </button>
              ) : (
                <span
                  onClick={handleNextStep}
                  disabled={step === 3}
                  className={`px-4 py-[.4rem] cursor-pointer rounded text-[.9rem]  flex items-center gap-0 ${
                    step === 3 ? "bg-gray-300" : "bg-orange-600 text-white"
                  }`}
                >
                  Next <GrFormNext className="h-5 w-5 text-white" />
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
