import { useActionState } from 'react'
import style from './ForgotPassword.module.css'

export default function ForgotPassword({sessionData}){
    const [recoveryData, recoveryAction, recoveryPending] = useActionState(SendRecoveryLink, undefined)

    async function SendRecoveryLink(prevData, formData){
        let email = formData.get("email")
        try{
            formData.append("frontendURL", window.location.origin)
            const response = await fetch(sessionData.mainURL + "/SendRecoveryLink", {
                method: "post",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            return result
        }
        catch(err){
            return { email, message: "Recovery Failed " + err }
        }
    }
    return(
        <div className = {style.forgotPasswordBody}>
            <div className = {style.titleBody}>
                <h1 className = {style.title}>Forgot Password?</h1>
            </div>
            <div>
                <form className = {style.inputBox} action = {recoveryAction}>
                    <span className = {style.icon} ><ion-icon name="mail"></ion-icon></span>
                    <input type="text" name = "email" defaultValue={recoveryData?.email} />
                    <label htmlFor="email">Email</label>
                    <button type = "submit" className = {style.btn} disabled = {recoveryPending}>{recoveryPending?"Recovering...":"Send Recovery Link"}</button>
                    {
                        recoveryPending?
                        <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                        :null
                    }
                    <span className = {recoveryData?.success ? style.success : style.failed}>{recoveryData?.message}</span>
                </form>
            </div>
        </div>
    )
}