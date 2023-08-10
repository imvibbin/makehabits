import { ChangeEvent, FormEvent, useState } from "react";
import UserInterface from "../models/UserInterface";
import { createUser } from "../services/UserService";
import { Link } from "react-router-dom";

import "./styles/RegisterPage.css";

const RegisterPage = () => {
  const userInitial = {
    user_id: 0,
    username: "",
    password: "",
    rol_id: 0,
  };

  const [user, setUser] = useState<UserInterface>(userInitial);
  const [btnStatus, setBtnClicked] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    setBtnClicked(!btnStatus);
    event.preventDefault();
    console.log(`Button status: ${btnStatus}`);
    console.log(user);
    createUser(user);
  };

  return (
    <>
      <div className="main-container container-fluid vh-100">
        <div className="row h-auto vh-100 overflow-hidden">
          <div className="main-container-banner col-md-7 d-flex align-items-center justify-content-center overflow-hidden">
            <div className="circle1 rounded-circle"></div>
            <div className="circle2 rounded-circle"></div>
          </div>
          <div className="main-container-content col-5 p-5 position-relative">
            <div className="main-container-content-form position-absolute">
              <h2>Welcome to Makehabits!</h2>
              <form onSubmit={handleSubmit} className="d-flex flex-column">
                <input
                  type="text"
                  id="username"
                  className="p-3 rounded-pill"
                  name="username"
                  placeholder="Username"
                  value={user.username}
                  onChange={handleOnChange}
                  required
                />
                <input
                  type="password"
                  id="password"
                  className="p-3 rounded-pill"
                  name="password"
                  placeholder="Password"
                  value={user.password}
                  onChange={handleOnChange}
                  required
                />
                <button
                  type="submit"
                  className={`p-3 rounded-pill mt-2 mb-2 ${
                    btnStatus ? "btn-triggered" : ""
                  }`}
                >
                  {btnStatus ? "Ok!" : "Register"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
