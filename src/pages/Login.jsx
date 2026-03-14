import { useState } from "react";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!email || !password) {
            alert("Please fill in all fields");
            return;
        }

        alert("Login successful");
    } ;

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
        <label>Email</label>
        <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
        />

        <br /><br />

        <label>Password</label>
        <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">Login</button>
        </form>
    </div>
  );
}

export default Login;
