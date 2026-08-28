 
import { useMailThreads } from "../hooks/useMailThreads";
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchCategories } from "../categories/categoryApi";
 
import MailListPage from "./MailListPage";
import { useGetActiveInboxTeamQuery, useGetInboxUsersQuery } from "../../../redux/api/inboxUserApi";
import { useGetCategoriesQuery } from "../../../redux/api/inboxCategoryApi";

export default function Mailbox() {
  // const [users, setUsers] = useState([]);
  // const [team, setTeam] = useState([]);
  // const [categories, setCategories] = useState([]);

  const mail = useMailThreads({
    endpoint: `${process.env.REACT_APP_API_URL}/api/v1/gmail/get-mailbox`,
  });



  const {
  data: users = [],
  isLoading: usersLoading,
  isFetching: usersFetching,
  error: usersError,
} = useGetInboxUsersQuery();


const {
  data: team = [],
  isLoading: teamLoading,
  isFetching: teamFetching,
} = useGetActiveInboxTeamQuery();


  const {
  data: categories = [],
  isLoading,
  isFetching,
} = useGetCategoriesQuery();



  // const getAllUsers = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/v1/user/get_all/users?module=inbox`,
  //     );
  //     const filteredUsers =
  //       data?.users?.filter((user) =>
  //         user.role?.access?.some((item) =>
  //           item?.permission?.includes("Inbox"),
  //         ),
  //       ) || [];

  //     setUsers(filteredUsers);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };







  // const getTeam = async () => {
  //   try {
  //     const { data } = await axios.get(
  //       `${process.env.REACT_APP_API_URL}/api/v1/user/get/active/team`,
  //     );

  //     const filteredUsers =
  //       data?.users?.filter((user) =>
  //         user.role?.access?.some((item) =>
  //           item?.permission?.includes("Inbox"),
  //         ),
  //       ) || [];

  //     setTeam(filteredUsers);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };





  // useEffect(() => {
  //   getAllUsers();
  //   getTeam();

  //   fetchCategories().then((res) => setCategories(res.data));
  // }, []);

  return (
    <MailListPage users={users} team={team} categories={categories} {...mail} />
  );
}
