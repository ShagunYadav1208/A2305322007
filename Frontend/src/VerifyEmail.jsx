import { useTransition, useState } from 'react'
import style from './VerifyEmail.module.css'
import { useParams, useNavigate } from 'react-router-dom'

export default function VerifyEmail({sessionData}){
    const { email, verification_token } = useParams()
    const [pending, startTransition] = useTransition()
    const navigate = useNavigate()
    const [status, setStatus] = useState({
        success: false,
        message: ""
    })

    const goToLogin = () => {
        navigate('/loginRegister')
    }
    const Verify = () => {
        startTransition(async() => {
            try{
                const response = await fetch(sessionData.mainURL + `/verifyEmail/${email}/${verification_token}`)
                const result = await response.json()
                setStatus({
                    success: result.success,
                    message: result.message
                })
            }
            catch(err){
                return setStatus({
                    success: false, 
                    message: "Something went wrong while verifing your email", err
                })
            }
        })
    }
    return(
        <div className = {style.verifyEmailBody}>
            <h1 className = {style.title}>Verify Email</h1>
            <div className = {style.verification}>
                <p className = {style.verificationText}>Click on the button below to verify your email.</p>
                {
                    pending?
                    <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                    :null
                }
                <button className = {style.verificationButton} disabled = {pending} onClick = {() => Verify()}>{pending?"Verifing...":"Verify"}</button>
                <span className = {status?.success ? style.success : style.failed}>{status?.message}</span>
            </div>
            <div className = {style.login}>
                {
                    status?.success ?
                    <button className = {style.loginButton} onClick = {() => goToLogin()}>Login</button> :
                    null
                }
            </div>
        </div>
    )
}