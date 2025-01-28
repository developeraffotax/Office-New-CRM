"use client";
import axios from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import Login from "./components/auth/Login";

export default function Home() {
  return (
    <div className="w-full h-full">
      <Login />
    </div>
  );
}
