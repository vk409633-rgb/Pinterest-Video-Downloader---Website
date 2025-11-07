import React from "react";
import styles from "./Button.module.css";

type Props = {
  disabled?: boolean;
};

const Button: React.FC<Props> = ({ disabled }) => {
  return (
    <button type="submit" className={styles.button} disabled={disabled} aria-busy={disabled}>
      Get Video
    </button>
  );
};

export default Button;
