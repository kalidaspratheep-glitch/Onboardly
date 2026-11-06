import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ activePage, setActivePage }) {
    const navigate = useNavigate();

    function handleNavigation(page) {
        if (setActivePage) {
            setActivePage(page);
        } else {
            navigate(`/?section=${page}`);
        }
    }

    return (
        <aside className="sidebar">
            <h2 className="logo">Onboardly</h2>

            <nav>
                <button
                    className={`nav-link ${activePage === "overview" ? "active" : ""}`}
                    onClick={() => handleNavigation("overview")}
                >
                    Overview
                </button>

                <button
                    className={`nav-link ${activePage === "employees" ? "active" : ""}`}
                    onClick={() => handleNavigation("employees")}
                >
                    Employees
                </button>

                <button
                    className={`nav-link ${activePage === "tasks" ? "active" : ""}`}
                    onClick={() => handleNavigation("tasks")}
                >
                    Tasks
                </button>

                <NavLink
                    to="/workflows"
                    className={({ isActive }) =>
                        `nav-link ${isActive ? "active" : ""}` //iaActive comes with NavLink (changed from Link to allow highlighting)
                    }
                >
                    Workflows
                </NavLink>
            </nav>
        </aside>
    );
}

export default Sidebar;