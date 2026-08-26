import "./Homepage.css";
import { useNavigate } from "react-router-dom";

function Homepage() {

    const navigate = useNavigate();
    return (

        <div className="homepage">
            {/* Top Navigation */}
            <nav className="homepage-nav">
                <div className="nav-left">
                    <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
                        Dashboard
                    </button>
                </div>

                <div className="nav-right">
                    <button className="login-btn">Login</button>
                    <button className="signup-btn">Sign Up</button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="homepage-content">
                <h1>AI-Integrated IoT Attendance System</h1>

                <p>
                    Smart and automated attendance using AI-powered face recognition.
                </p>


            </main>
        </div>
    );
}

export default Homepage;