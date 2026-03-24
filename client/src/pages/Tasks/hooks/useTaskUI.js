import { useState } from "react";

const useTaskUI = () => {
  const [ui, setUI] = useState({
    showDepartment: false,
    showCompleted: false,
    showJobHolder: false,
    showDue: false,
    showStatus: false,
    showProject: false,
    showlabel: false,
    showDetail: false,
    showEdit: false,
    show_completed: false,
  });

  const {
    showDepartment,
    showCompleted,
    showJobHolder,
    showDue,
    showStatus,
    showProject,
    showlabel,
    showDetail,
    showEdit,
    show_completed,
  } = ui;

  const set = (key) => (val) =>
    setUI((prev) => ({
      ...prev,
      [key]: typeof val === "function" ? val(prev[key]) : val,
    }));

  return {
    ui,
    setUI,
    showDepartment,
    showCompleted,
    showJobHolder,
    showDue,
    showStatus,
    showProject,
    showlabel,
    showDetail,
    showEdit,
    show_completed,
    setShowDepartment: set("showDepartment"),
    setShowCompleted: set("showCompleted"),
    setShowJobHolder: set("showJobHolder"),
    setShowDue: set("showDue"),
    setShowStatus: set("showStatus"),
    setShowProject: set("showProject"),
    setShowlabel: set("showlabel"),
    setShowDetail: set("showDetail"),
    setShowEdit: set("showEdit"),
  };
};

export default useTaskUI;
