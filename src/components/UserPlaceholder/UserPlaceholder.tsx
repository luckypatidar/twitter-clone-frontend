import axios from "axios";
import React, { useState, useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";
import { UserProfile } from "../../types";

type UserPlaceholderProps = {
  userData: UserProfile | null;
  setUserData: React.Dispatch<React.SetStateAction<UserProfile | null>>
}

const UserPlaceholder = ({ setUserData, userData }: UserPlaceholderProps) => {
  const { id } = useParams();
  const location = useLocation().pathname;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await axios.get(`/users/find/${id}`);
        setUserData(userProfile.data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  }, [id]);

  return <div>{userData?.username}</div>;
};

export default UserPlaceholder;
