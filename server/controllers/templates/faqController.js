import FAQModel from "../../models/templates/FAQModel.js";

// Create FAQ
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category } = req.body;

    if (!question) {
      return res.status(400).send({
        success: false,
        message: "Question is required!",
      });
    }

    const faq = await FAQModel.create({ question, answer, category });

    res.status(200).send({
      success: true,
      message: "FAQ added!",
      faq: faq,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create FAQ's",
      error: error,
    });
  }
};

// Get All FAQ's
export const getAllFAQ = async (req, res) => {
  try {
    const faqs = await FAQModel.find({});
    res.status(200).send({
      success: true,
      message: "FAQ list!",
      faqs: faqs,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while create FAQ's",
      error: error,
    });
  }
};

// Update FAQ
export const updateFAQ = async (req, res) => {
  try {
    const faqId = req.params.id;
    const { question, answer, category } = req.body;

    if (!question) {
      return res.status(400).send({
        success: false,
        message: "Question is required!",
      });
    }

    const isExistingFAQ = await FAQModel.findById({ _id: faqId });

    if (!isExistingFAQ) {
      return res.status(400).send({
        success: false,
        message: "FAQ id is required!",
      });
    }

    const faq = await FAQModel.findByIdAndUpdate(
      { _id: isExistingFAQ._id },
      { question, answer, category },
      { new: true }
    );

    res.status(200).send({
      success: true,
      message: "FAQ updated successfully!",
      faq: faq,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while update FAQ's",
      error: error,
    });
  }
};

// Delete FAQ
export const deleteFAQ = async (req, res) => {
  try {
    const faqId = req.params.id;

    const isExistingFAQ = await FAQModel.findById({ _id: faqId });

    if (!isExistingFAQ) {
      return res.status(400).send({
        success: false,
        message: "FAQ not found!",
      });
    }

    await FAQModel.findByIdAndDelete({ _id: isExistingFAQ._id });

    res.status(200).send({
      success: true,
      message: "FAQ delete successfully!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while delete FAQ's",
      error: error,
    });
  }
};

// Get Single FAQ's
export const getSingleFaq = async (req, res) => {
  try {
    const faqId = req.params.id;

    const isExistingFAQ = await FAQModel.findById({ _id: faqId });

    if (!isExistingFAQ) {
      return res.status(400).send({
        success: false,
        message: "FAQ not found!",
      });
    }

    res.status(200).send({
      success: true,
      message: "Single FAQ!",
      faq: isExistingFAQ,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error while get single FAQ's",
      error: error,
    });
  }
};
