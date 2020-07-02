import React from 'react';
import { validateFavIcon } from '../../utils/helpers';

type TabFavIconProps = {
  tab: chrome.tabs.Tab;
};

const TabFavIcon: React.FC<TabFavIconProps> = ({ tab }) => {
  const validFavIcon = validateFavIcon(tab);
  return (
    <div>
      <img style={{
        verticalAlign: 'middle',
        width: '100%'
      }} src={validFavIcon} />
    </div>
  );
};

export default TabFavIcon;
