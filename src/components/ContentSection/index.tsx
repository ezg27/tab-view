import React from 'react';
import styles from './ContentSection.module.scss';

type ContentSectionProps = {
  scrollRef: any
};

const ContentSection: React.FC<ContentSectionProps> = ({ children, scrollRef }) => {
  return <main ref={scrollRef} className={styles.contentSection}>{children}</main>;
};

export default ContentSection;
