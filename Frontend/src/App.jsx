import { useEffect, useState } from 'react'
import style from './App.module.css'
import { Route, Routes } from 'react-router'
import Navbar from './Navbar'
import LoginRegister from "./LoginRegister"
import VerifyEmail from "./VerifyEmail"
import PageNotFound from "./PageNotFound"
import About from "./About"
import Contact from "./Contact"
import Home from './Home'
import ForgotPassword from "./ForgotPassword"
import ResetPassword from "./ResetPassword"

function App() {
  const [displayLogin, setDisplayLogin] = useState(true)
  const [sessionData, setSessionData] = useState({
        mainURL: "",
        isLogin: false,
        user: null,
        session: {}
    })

  function fetchSessionData(){
    try{
      fetch("http://localhost:1700/api/session-info", {
        credentials: "include"
      })
      .then((res) => res.json())
      .then((data) => {
        setSessionData(data)
        console.log("Data Fetched")
      })
    }
    catch(err){
      console.log("Data Fetch Failed " + err)
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  return (
    <div className = {style.body}>
      <Routes>
        <Route element = {<Navbar setDisplayLogin = {setDisplayLogin} sessionData = {sessionData} fetchSessionData = {fetchSessionData}></Navbar>}>
        <Route path = "/" element = {<Home sessionData = {sessionData}></Home>}></Route>
        <Route path = "/loginRegister/" element = {displayLogin?<LoginRegister setDisplayLogin = {setDisplayLogin} sessionData = {sessionData} fetchSessionData = {fetchSessionData}></LoginRegister>:null}></Route>
        <Route path = "/about" element = {<About></About>}></Route>
        <Route path = "/contact" element = {<Contact></Contact>}></Route>
        <Route path = "/verifyEmail/:email/:verification_token" element = {<VerifyEmail sessionData = {sessionData}></VerifyEmail>}></Route>
        <Route path = "/forgotPassword" element = {<ForgotPassword sessionData = {sessionData}></ForgotPassword>}></Route>
        <Route path = "/resetPassword/:email/:reset_token" element = {<ResetPassword sessionData = {sessionData}></ResetPassword>}></Route>

        <Route path = "/*" element = {<PageNotFound></PageNotFound>}></Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
