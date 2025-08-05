import { useActionState } from 'react'
import style from './ResetPassword.module.css'
import { useNavigate, useParams } from 'react-router-dom'

export default function ResetPassword({sessionData}){
    const [resetData, resetAction, resetPending] = useActionState(handleReset, undefined)
    const { email, reset_token } = useParams()
    const navigate = useNavigate()
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/

    async function handleReset(prevData, formData){
        let password = formData.get("password")
        let confirmPassword = formData.get("confirmPassword")
        if(password != confirmPassword){
            return { password, confirmPassword, message: "Password and Confirm Password should be same" }
        }
        else if(!passwordRegex.test(password)){
            return { password, confirmPassword, message: "Password must have 8 character, should contain at least one alphabet, one digit and one special character" }
        }
        else{
            try{
                formData.append("email", email)
                formData.append("reset_token", reset_token)
                const response = await fetch(sessionData.mainURL + "/ResetPassword", {
                    method: "post",
                    body: formData,
                    credentials: "include"
                })
                const result = await response.json()
                if(result.success){
                    navigate(`/${result.redirectTo}`)
                }
                else{
                    return result
                }
            }
            catch(err){
                return { password, confirmPassword, message: "Password Reset Failed: " + err }
            }
        }
    }
    return(
        <div className = {style.resetPasswordBody}>
            <div className = {style.titleBody}>
                <h1 className = {style.title}>Reset Password</h1>
            </div>
            <div>
                <form action = {resetAction}>
                    <div className = {style.inputBox}>
                        <span className = {style.icon} ><ion-icon name="lock-closed"></ion-icon></span>
                        <input type="text" name = "password" defaultValue={resetData?.password} />
                        <label htmlFor="password">Password</label>
                    </div>
                    <div className = {style.inputBox}>
                        <span className = {style.icon} ><ion-icon name="lock-closed"></ion-icon></span>
                        <input type="text" name = "confirmPassword" defaultValue={resetData?.confirmPassword} />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                    </div>
                    <button type = "submit" className = {style.btn} disabled = {resetPending}>{resetPending?"Reseting...":"Reset Password"}</button>
                    {
                        resetPending?
                        <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                        :null
                    }
                    <span className = {resetData?.success ? style.success : style.failed}>{resetData?.message}</span>
                </form>
            </div>
        </div>
    )
}