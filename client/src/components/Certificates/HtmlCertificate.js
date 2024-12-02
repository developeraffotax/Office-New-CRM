import React from "react";
import styles from "./HtmlCertificate.module.css";

const HtmlCertificate = ({ username, course, date, signature }) => {
  return (
    <div className={styles.certificateBody}>
      <div className={styles.certificateContainer}>
        <div className={styles.certificateSeal}>
          {/* Optional: Add a seal or logo */}
          {/* <img src="https://example.com/seal.png" alt="Certificate Seal" /> */}
        </div>
        <div className={styles.certificateTitle}>
          Certificate of Achievement
        </div>
        <div className={styles.certificateContent}>
          <p>This certificate is proudly presented to</p>
          <h2>{username}</h2>
          <p>for successfully completing the</p>
          <h2>{course}</h2>
          <p>course.</p>
        </div>
        <div className={styles.certificateFooter}>
          <div className={styles.signature}>
            <div
              dangerouslySetInnerHTML={{ __html: signature }}
              className={styles.signatureImage}
            ></div>
            <p>Authorized Signature</p>
          </div>
          <div className={styles.date}>Date: {date}</div>
        </div>
      </div>
    </div>
  );
};

export default HtmlCertificate;
