import { Outlet } from "react-router-dom";
import { SmallSidebar, BigSidebar, Navbar, Copyright } from "../components";
const SharedLayout = () => {
  return (
    <main className="principal">
      <SmallSidebar />
      <BigSidebar />
      <div className="principal-page">
        <Navbar />
        <div>
          <Outlet />
        </div>
      </div>
      <Copyright />
    </main>
  );
};
export default SharedLayout;
