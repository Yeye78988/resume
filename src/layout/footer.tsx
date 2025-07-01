import React from 'react';
import './footer.less';
import { getSearchObj } from '@/helpers/location';
const Footer: React.FC = () => {
  const user = getSearchObj().user || 'Yeye78988';

  return (
    <footer>
      <div>
        <div></div>
      </div>
    </footer>
  );
};

export default Footer;
