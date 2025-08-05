import style from './PageNotFound.module.css'

export default function PageNotFound(){
    return(
        <div className = {style.pageNotFoundBody}>
            <h1 className = {style.title}>Page Not Found</h1>
        </div>
    )
}