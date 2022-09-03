import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import { logoutUser, clearValues } from "../features/user/userSlice";
import { links } from "../utils/links";
import Logo from "./Logo";

export default function Navbar() {
  const [cookies, setCookie, removeCookie] = useCookies();
  const { user } = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logout = () => {
    dispatch(logoutUser());
    dispatch(clearValues());
    removeCookie("sb-access-token", { path: "/" });
    removeCookie("sb-refresh-token", { path: "/" });
    navigate("/register", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-sm bg-primary navbar-dark sticky-top p-0 m-0">
      <div className="container-fluid">
        <a href="/" className="navbar-brand">
          <Logo />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collapsibleNavbar">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse text-align-start" id="collapsibleNavbar">
          <ul className="navbar-nav align-content-start justify-content-sm-start justify-content-md-between flex-sm-grow-1">
            {user.isAdmin ? (
              <>
                {links.map((page) => {
                  return (
                    <li key={page.id} className="nav-item text-capitalize">
                      <Link to={page.path} className="nav-link">
                        {page.text}
                      </Link>
                    </li>
                  );
                })}
              </>
            ) : (
              <></>
            )}
            <div className="d-inline-flex m-0 p-0">
              <li className="navbar-item dropdown">
                <a href="/register" className="nav-link dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  {user?.email}
                </a>
                <ul className="dropdown-menu">
                  <li>
                    <a href="/register" className="dropdown-item" onClick={logout}>
                      Logout
                    </a>
                  </li>
                </ul>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </nav>
  );
}
