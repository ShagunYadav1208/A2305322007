import { useActionState, useState } from "react";
import style from "./LoginRegister.module.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router";

export default function LoginRegister({setDisplayLogin, sessionData, fetchSessionData})
{
    const [login, setLogin] = useState(true)
    const [isActive, setIsActive] = useState(false)
    const [loginData, loginAction, loginPending] = useActionState(handleLogin, undefined)
    const [registerData, registerAction, registerPending] = useActionState(handleRegister, undefined)
    const navigate = useNavigate()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/

    async function handleRegister(prevData, formData){
        let name = formData.get("name")
        let email = formData.get("email")
        let password = formData.get("password")
        if(!emailRegex.test(email)){
            return { name: name, email: email, password: password, message: "Enter a valid email" }
        }
        else if(!passwordRegex.test(password)){
            return { name: name, email: email, password: password, message: "Password must have 8 character, should contain at least one alphabet, one digit and one special character" }
        }
        else{
            try{
                formData.append("frontendURL", window.location.origin)
                const response = await fetch(sessionData.mainURL + "/Register", {
                    method: "post",
                    body: formData,
                    credentials: "include"
                })

                const result = await response.json()
                return result
            }
            catch(err){
                return { name: name, email: email, password: password, message: "Registration Failed " + err }
            }
        }
    }

    async function handleLogin(prevData, formData){
        let email = formData.get("email")
        let password = formData.get("password")
        try{
            const response = await fetch(sessionData.mainURL + "/Login", {
                method: "post",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                fetchSessionData()
                navigate("/")
            }
            return result
        }
        catch(err){
            return { email: email, password: password, message: "Login Failed " + err }
        }
    }
    return(
        <div className = {`${style.wrapper} ${isActive?style.active:''}`}>
            <span className = {style.iconClose} onClick = {()=>setDisplayLogin(false)}><ion-icon name="close"></ion-icon></span>
            {
                login?<div className = {`${style.formBox} ${style.login}`}>
                    <h2>Login</h2>
                    <form action = {loginAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="mail"></ion-icon></span>
                            <input type="text" name = "email" defaultValue = {loginData?.email} required></input>
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className = {style.inputBox}>
                            <span className = {style.icon}><ion-icon name="lock-closed"></ion-icon></span>
                            <input type="password" name = "password" defaultValue = {loginData?.password} required></input>
                            <label htmlFor="password">Password</label>
                        </div>
                        <div className = {style.rememberForgot}>
                            {/* <label htmlFor="showPassword"><input type="checkbox" />Show Password</label> */}
                            <Link to = "/forgotPassword">Forgot Password?</Link>
                        </div>
                        {
                            loginPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {loginPending}>{loginPending?"Logging...":"Login"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {loginData?.success ? style.success : style.failed}>{loginData?.message}</span>
                            <p>Don't have an account? <a href="#" className = {style.registerLink} onClick = {()=>{setLogin(false), setIsActive(true)}}>Register</a></p>
                        </div>
                    </form>
                </div>:
                <div className = {`${style.formBox} ${style.register}`}>
                    <h2>Register</h2>
                    <form action = {registerAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="person"></ion-icon></span>
                            <input type="text" name = "name" defaultValue = {registerData?.name} required></input>
                            <label htmlFor="name">Name</label>
                        </div>
                        <div className = {style.inputBox}>
                            <span className = {style.icon}><ion-icon name="mail"></ion-icon></span>
                            <input type="text" name = "email" defaultValue = {registerData?.email} required></input>
                            <label htmlFor="email">Email</label>
                        </div>
                        <div className = {style.inputBox}>
                            <span className = {style.icon}><ion-icon name="lock-closed"></ion-icon></span>
                            <input type="password" name = "password" defaultValue = {registerData?.password} required></input>
                            <label htmlFor="password">Password</label>
                        </div>
                        {
                            registerPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {registerPending}>{registerPending?"Registering...":"Register"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {registerData?.success ? style.success : style.failed}>{registerData?.message}</span>
                            <p>Already have an account? <a href="#" className = {style.loginLink} onClick = {()=>{setLogin(true), setIsActive(false)}}>Login</a></p>
                        </div>
                    </form>
                </div>
            }
        </div>
    )
}