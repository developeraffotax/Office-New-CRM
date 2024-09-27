import React from "react";
import { useAuth } from "../../context/authContext";
import Layout from "../../components/Loyout/Layout";

export default function Dashboard() {
  const { auth } = useAuth();
  return (
    <Layout title="CRM_Dashboard">
      <div>Dashboard</div>
    </Layout>
  );
}
