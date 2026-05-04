import Signature from "../models/signatureModel.js";

 
export const listSignatures = async (req, res) => {
  try {
    const { search, company } = req.query;
    let query = {};

    // Filter by company if provided (affotax or outsource)
    if (company) query.company = company;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const signatures = await Signature.find(query).sort({ is_default: -1, created_at: -1 });
    res.json({ data: signatures });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSignature = async (req, res) => {
  try {
    const sig = await Signature.findById(req.params.id);
    if (!sig) return res.status(404).json({ error: 'Not found' });
    res.json({ data: sig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createSignature = async (req, res) => {
  try {
    const sig = new Signature(req.body);
    await sig.save();
    res.status(201).json({ data: sig });
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ error: err.message });
  }
};

export const updateSignature = async (req, res) => {
  try {
    // { runValidators: true } ensures company enum is checked
    const sig = await Signature.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sig) return res.status(404).json({ error: 'Not found' });
    
    // Trigger pre-save hook logic if is_default was toggled to true
    if (req.body.is_default) await sig.save(); 
    
    res.json({ data: sig });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const removeSignature = async (req, res) => {
  try {
    const sig = await Signature.findByIdAndDelete(req.params.id);
    if (!sig) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const setDefaultSignature = async (req, res) => {
  try {
    const sig = await Signature.findById(req.params.id);
    if (!sig) return res.status(404).json({ error: 'Not found' });

    sig.is_default = true;
    // The pre-save hook in the model handles clearing other defaults FOR THAT COMPANY only
    await sig.save(); 
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};