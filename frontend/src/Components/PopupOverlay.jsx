import React, { useEffect } from "react";

const PopupOverlay = ({ children, className, closePopup, mediumHeight, bgColor, maxWidth, styles = {}, addEscapeHandler }) => {

    useEffect(() => {
        const keyDownHandler = (event) => {
            if (event.key === "Escape" && closePopup) {
                closePopup();
            }
        };

        if (addEscapeHandler && closePopup) {
            window.addEventListener("keydown", keyDownHandler);
        }

        return () => {
            window.removeEventListener("keydown", keyDownHandler);
        };
    }, [addEscapeHandler, closePopup]);

    const clickHadnler = (e) => {
        if (document.getElementById("clickbox").contains(e.target)) {
        } else {
            closePopup && closePopup();
        }
    };

    let adminFormContainerStyles = {
        background: bgColor ? bgColor : "var(--color-premitive-grey--4)",
    };

    if (maxWidth) {
        adminFormContainerStyles.maxWidth = maxWidth;
    }

    if (styles) {
        adminFormContainerStyles = { ...adminFormContainerStyles, ...styles };
    }


    return (
        <div className={`adminPopupOverlay  ${className && className}`} onClick={clickHadnler}>
            <div id="clickbox" className="col-11 col-md-9 col-lg-6 admin-popup-container overflow-y-auto mx-auto" style={adminFormContainerStyles} >
                {children}
            </div>
        </div>
    );
};


export default PopupOverlay;
