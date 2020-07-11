import React from 'react';
import { mutate } from 'swr';
import styles from './ErrorFallback.module.scss';

type ErrorFallbackProps = {
  resetErrorState?: () => void;
};

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ resetErrorState }) => {
  return (
    <section className={styles.errorFallback}>
      <h3>Oops, something went wrong!</h3>
      <p>Please click below to refresh the extension.</p>
      <button
        onClick={() => {
          if (resetErrorState) {
            resetErrorState();
          }
          mutate('getWindows');
        }}
      >
        Refresh
      </button>
    </section>
  );
};

export default ErrorFallback;
