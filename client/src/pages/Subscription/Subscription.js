import React, { useEffect, useState } from "react";
import Layout from "../../components/Loyout/Layout";
import { style } from "../../utlis/CommonStyle";
import { IoClose } from "react-icons/io5";
import SubscriptionModel from "../../components/SubscriptionModel";
import axios from "axios";

export default function Subscription() {
  const [show, setShow] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState([]);
  const [subscriptionId, setSubscriptionId] = useState("");

  // -------Get Subscription Data-------
  const getAllSubscriptions = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal`
      );
      if (data) {
        setSubscriptionData(data.proposals);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/proposal/fetch/proposal`
      );
      if (data) {
        setSubscriptionData(data.proposals);
      }
    } catch (error) {
      console.log(error);
    }
  };

  //---------- Get All Users-----------
  const getAllUsers = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users`
      );
      setUsers(data?.users);

      setUserName(data?.users.map((user) => user.name));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllUsers();
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <div className=" relative w-full h-[100%] overflow-y-auto py-4 px-2 sm:px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className=" text-xl sm:text-2xl font-semibold ">
              Subscription
            </h1>

            <span
              className={` p-1 rounded-md hover:shadow-md mb-1 bg-gray-50 cursor-pointer border `}
              onClick={() => {
                // handleClearFilters();
              }}
              title="Clear filters"
            >
              <IoClose className="h-6 w-6  cursor-pointer" />
            </span>
          </div>

          {/* ---------Buttons ------*/}
          <div className="flex items-center gap-4">
            <button
              className={`${style.button1} text-[15px] `}
              onClick={() => setShow(true)}
              style={{ padding: ".4rem 1rem" }}
            >
              New Subscription
            </button>
          </div>
        </div>
        <hr className="w-full h-[1px] bg-gray-300 my-4" />

        {/*----------Add/Edit Subscription--------- */}
        {show && (
          <div className="fixed top-0 left-0 w-full h-[100%] z-[999] bg-gray-100/70 flex items-center justify-center py-6  px-4">
            <SubscriptionModel
              setIsOpen={setShow}
              fetchSubscriptions={fetchSubscriptions}
              subscriptionId={subscriptionId}
              setSubscriptionId={setSubscriptionId}
            />
          </div>
        )}
      </div>
    </Layout>
  );
}
