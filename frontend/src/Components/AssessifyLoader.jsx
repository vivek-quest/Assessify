import React from 'react'
import logo from '../assets/Images/Assessify.png'

const AssessifyLoader = () => {
    return (
        <div
            id="loader"
            style={{
                zIndex: "100",
                background: "rgb(215 215 215 / 80%)",
                display: "block",
                height: "100%",
                width: "100%",
                position: "fixed",
                zIndex: "100002",
            }}
        >
            <div className="loader-container">
                <img src={logo} className="center-image" alt="" />
            </div>
        </div>
    )
}

export default AssessifyLoader;
