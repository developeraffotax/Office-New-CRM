"use client";
import React, { useState } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { Helmet } from "react-helmet";
import Sidebar from "./Sidebar";
import AdminProtected from "@/app/middleware/AdminProtected";
import Header from "./Header";

export default function MainLayout({
  children,
  title,
  description,
  keywords,
  author,
}) {
  const [show, setShow] = useState(false);
  const [hide, setHide] = useState(false);

  return (
    <AdminProtected>
      <Helmet>
        <meta charSet="utf-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>
      <div className="relative w-full h-screen overflow-hidden flex flex-col text-black ">
        <Header show={show} setShow={setShow} />
        <div className=" w-full flex-1 gap-0 flex h-[calc(100vh-4rem)]  fixed top-[4rem] left-0 z-[999] overflow-hidden">
          <div
            className={`hidden sm:flex  transition-all duration-200  ${
              hide ? "w-[5rem]" : "w-[16rem]"
            }`}
          >
            <Sidebar hide={hide} setHide={setHide} />
          </div>
          {show && (
            <div className=" absolute top-0 left-0 flex  bg-white sm:hidden z-[999] w-[13rem] pt-[0rem]">
              <Sidebar />
            </div>
          )}
          <div className="flex flex-col w-full h-[calc(100vh-4rem)] overflow-hidden">
            <div className="flex-[1.8] bg-gray-100 w-full h-[calc(100vh-3.8rem)]  overflow-y-auto shidden  ">
              {children}
            </div>
          </div>
        </div>
      </div>
    </AdminProtected>
  );
}

MainLayout.defaultProps = {
  title: "Sync AI - Admin Panel ",
  description:
    "Sync AI Panel is an intuitive and powerful admin interface for managing your e-commerce store. Track orders, manage products, and oversee inventory with ease. Built with MERN stack.",
  keywords:
    "AI admin panel, MERN stack, Sync AI, product management, order management, inventory control, online store dashboard, eCommerce backend, admin dashboard, e-commerce store management, admin interface",
  author: "Salman Sadiq",
};
