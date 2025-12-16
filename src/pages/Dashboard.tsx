import UserData from "../components/UserData";
import Header from "../components/header";
import ReadyVideoTable from "../components/readyvideoTable";
import VideoTable from "../components/videoTable";

const Dashboard = () => {
  return (
    <div>
      <Header />

      <div className="space-y-8">
        <VideoTable title="Raw Videos" />
        <ReadyVideoTable/>
      </div>
      <UserData />
    </div>
  );
};

export default Dashboard;
