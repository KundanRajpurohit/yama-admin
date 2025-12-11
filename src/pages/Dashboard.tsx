import React from "react";
import UserData from "../components/UserData";
import Header from "../components/header";
import VideoTable from "../components/videoTable";
import ReadyVideoTable from "../components/readyvideoTable";

const Dashboard = () => {
  return (
    <div>
      <Header />

      <div className="space-y-8">
        <VideoTable title="Raw Videos" />
        {/* <VideoTable title="Ready Videos" /> */}
        <ReadyVideoTable/>
      </div>
      <UserData />
    </div>
  );
};

export default Dashboard;
