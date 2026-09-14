import React, { useState } from "react";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { style } from "../../utlis/CommonStyle";
import { TbLoader2 } from "react-icons/tb";
import axios from "axios";

export default function HandleHrProductModal({
  setIsHandleHrProduct,
  fetchAllHrProducts,
  hrProduct,
  setHrProduct,
  getAllTasks,
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(() => hrProduct?.name || "");

  // -----------Create / Update Product-------->
  const handleProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (hrProduct) {
        // Update
        const { data } = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/v1/hrProduct/update/${hrProduct?._id}`,
          { name }
        );
        if (data?.success) {
          getAllTasks && getAllTasks();
          setLoading(false);
          setHrProduct(null);
          fetchAllHrProducts && fetchAllHrProducts();
          setName("");
          setIsHandleHrProduct(false);
          toast.success("Product Updated!");
        }
      } else {
        // Create
        const { data } = await axios.post(
          `${process.env.REACT_APP_API_URL}/api/v1/hrProduct/create`,
          { name }
        );
        if (data?.success) {
          setLoading(false);
          setName("");
          setIsHandleHrProduct(false);
          fetchAllHrProducts && fetchAllHrProducts();
          getAllTasks && getAllTasks();
          toast.success("Product Created successfully!");
        }
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="w-[21rem] sm:w-[34rem] rounded-md shadow border flex flex-col gap-4 bg-white">
      <div className="flex items-center justify-between px-4 pt-2">
        <h1 className="text-[20px] font-semibold text-black">
          {hrProduct ? "Update Product" : "Add Product"}
        </h1>
        <span
          className="cursor-pointer"
          onClick={() => {
            setHrProduct(null);
            setIsHandleHrProduct(false);
          }}
        >
          <IoClose className="h-6 w-6" />
        </span>
      </div>

      <hr className="h-[1px] w-full bg-gray-400" />

      <div className="w-full py-2 px-4">
        <form onSubmit={handleProduct} className="w-full flex flex-col gap-4">
          <input
            type="text"
            placeholder="Product Name"
            required
            className={`${style.input} w-full`}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex items-center justify-end">
            <button
              className={`${style.button1} text-[15px]`}
              type="submit"
              style={{ padding: ".4rem 1rem" }}
              disabled={loading}
            >
              {loading ? (
                <TbLoader2 className="h-5 w-5 animate-spin text-white" />
              ) : (
                <span>{hrProduct ? "Update" : "Create"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}