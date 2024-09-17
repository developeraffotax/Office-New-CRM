import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";

export default function AddFaq({
  faqId,
  setFaqId,
  setIsAddFAQ,
  categoryData,
  setFaqData,
  getFaqs,
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  // Single FAQ
  const singleFaq = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/faqs/single/faq/${faqId}`
      );

      setQuestion(data?.faq.question);
      setAnswer(data?.faq.answer);
      setCategory(data?.faq.category);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    singleFaq();

    // eslint-disable-next-line
  }, [faqId]);

  // -----------Create / Update Template-------->
  const handleTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (faqId) {
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/faqs/update/faq/${faqId}`,
          { question, answer, category }
        );
        if (data?.success) {
          getFaqs();
          setLoading(false);
          setFaqId("");
          setQuestion("");
          setAnswer("");
          setCategory("");
          setIsAddFAQ(false);
          toast.success("FAQ updated successfully!");
        }
      } else {
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/faqs/create/faq`,
          { question, answer, category }
        );
        if (data) {
          // setFaqData((prevData) => [...prevData, data.faq]);
          getFaqs();
          setLoading(false);
          setFaqId("");
          setQuestion("");
          setAnswer("");
          setCategory("");
          setIsAddFAQ(false);
          toast.success("FAQ Added!");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message);
    }
  };
  return (
    <div className="w-[21rem] sm:w-[35rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {faqId ? "Update FAQ's" : "Add FAQ's"}
        </h1>
        <span
          className=" cursor-pointer"
          onClick={() => {
            setFaqId("");
            setIsAddFAQ(false);
          }}
        >
          <IoClose className="h-6 w-6 " />
        </span>
      </div>
      <hr className="h-[1px] w-full bg-gray-400 " />
      <div className="w-full py-2 px-4">
        <form onSubmit={handleTemplate} className="w-full flex flex-col gap-4 ">
          <textarea
            placeholder="Question"
            required
            className={`${style.input} w-full resize-none h-[4rem]`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <textarea
            placeholder="Answer"
            required
            className={`${style.input} w-full resize-none h-[6rem]`}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <select
            className={`${style.input}`}
            value={category}
            required
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Select Category</option>
            {categoryData &&
              categoryData?.map((cat) => (
                <option
                  key={cat?._id}
                  value={cat?.name}
                  className=" flex items-center gap-1"
                >
                  {cat?.name}
                </option>
              ))}
          </select>

          {/*  */}
          <div className="flex items-center justify-end mt-[2.5rem]">
            <button
              disabled={loading}
              className={`${style.button1} text-[15px] `}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{faqId ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
