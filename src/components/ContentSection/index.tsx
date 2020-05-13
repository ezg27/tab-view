import React from 'react';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {};

const ContentSection: React.FC<ContentSectionProps> = ({ children }) => {
  return <main className={styles.contentSection}>{children}</main>;
};

export default ContentSection;
