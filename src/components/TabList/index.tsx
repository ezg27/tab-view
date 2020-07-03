import React, { memo } from 'react';
import { Droppable, DroppableProvided } from 'react-beautiful-dnd';
import { useFuzzySearch } from '../../hooks/useFuzzySearch';
import TabListItem from '../TabListItem';
import styles from './TabList.module.scss';

type TabListProps = {
  searchTerm: string;
  window: ChromeWindow;
};

const TabList: React.FC<TabListProps> = memo(({ searchTerm, window }) => {
  const result = useFuzzySearch<chrome.tabs.Tab>(searchTerm, window.tabs || [], {
    keys: ['title', 'url'],
    threshold: 0.3,
    distance: 1000,
  });

  return (
    <div className={styles.tabList}>
      <Droppable droppableId={`${window.id}`}>
        {(provided: DroppableProvided) => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <ul>
              {result.length === 0 && <span className={styles.emptyListMessage}>Nothing to show...</span>}
              {result.map((tab, index) => (
                <TabListItem key={tab.id} tab={tab} tabIndex={index} parentWindow={window} />
              ))}
            </ul>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
});

export default TabList;
