import { Link, NavLink, Outlet, useNavigate } from 'react-router';
import style from './Navbar.module.css';
import { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';

export default function Navbar({ setDisplayLogin, sessionData, fetchSessionData })
{
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setDropdownOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])
    const handleClick = () => {
        navigate('/loginRegister')
    }
    const handleLogout = async() => {
        try{
            const response = await fetch(sessionData.mainURL + "/Logout", {
                methond: "GET",
                credentials: "include"
            })

            const result = await response.json()
            if(result.success){
                fetchSessionData()
                navigate("/")
            }
            else{
                alert("Logout Failed")
            }
        }
        catch(err){
            console.error("Logout error: ", err)
            alert("Error while logging out.")
        }
    }
    return(
        <div>
            <div className = {style.header}>
                <h2 className = {style.logo}>URLShortner</h2>
                <nav className = {style.navigation}>
                    <NavLink className = {({isActive}) => isActive? `${style.active} ${style.link}`: `${style.link}`} to = "/">Home</NavLink>
                    <NavLink className = {({isActive}) => isActive? `${style.active} ${style.link}`: `${style.link}`} to = "/about">About</NavLink>
                    <NavLink className = {({isActive}) => isActive? `${style.active} ${style.link}`: `${style.link}`} to = "/contact">Contact</NavLink>
                    {
                        sessionData.isLogin ?
                        <div className = {style.dropdown} ref = {dropdownRef}>
                            <button className = {style.dropdownToggle} onClick = {() => setDropdownOpen(!dropdownOpen)}>
                            {sessionData.user.name}
                            <span className = {`${style.arrow} ${dropdownOpen ? style.up : style.down}`}></span>
                            </button>
                            {dropdownOpen && (
                            <div className = {style.dropdownMenu}>
                                <Link to = "/profile">Profile</Link>
                                <Link to = "/search">URLShortner</Link>
                                <Link className = {style.logout} onClick = {() => {handleLogout(), setDropdownOpen(false)}}>Logout</Link>
                            </div>
                            )}
                        </div> :
                        <button className = {style.btnLoginPopup} onClick = { ()=>{ setDisplayLogin(true), handleClick() } }>Login</button>

                    }
                </nav>
            </div>
            <Outlet></Outlet>
        </div>
    )
}