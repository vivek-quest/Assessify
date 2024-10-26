const AllSvgs = ({ type, color, className = '' }) => {
    const combinedClassName = `${className}`;

    switch (type) {
        case 'delete':
            return (
                <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={combinedClassName}
                >
                    <path d="M10 12V17" stroke={color || "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 12V17" stroke={color || "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 7H20" stroke={color || "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke={color || "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke={color || "#000000"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'edit':
            return (
                <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={combinedClassName}
                >
                    <path fillRule="evenodd" clipRule="evenodd" d="m3.99 16.854-1.314 3.504a.75.75 0 0 0 .966.965l3.503-1.314a3 3 0 0 0 1.068-.687L18.36 9.175s-.354-1.061-1.414-2.122c-1.06-1.06-2.122-1.414-2.122-1.414L4.677 15.786a3 3 0 0 0-.687 1.068zm12.249-12.63 1.383-1.383c.248-.248.579-.406.925-.348.487.08 1.232.322 1.934 1.025.703.703.945 1.447 1.025 1.934.058.346-.1.677-.348.925L19.774 7.76s-.353-1.06-1.414-2.12c-1.06-1.062-2.121-1.415-2.121-1.415z" fill={color || "#000000"} />
                </svg>
            );
        default:
            return null;
    }
};

export default AllSvgs;
