import React from 'react';
import style from './Button.css';
const Button = ({ label, onClick }) => {
    return (
        <button onClick={onClick} style={style.button}>
            {label}
        </button>
    );
};


export default Button;