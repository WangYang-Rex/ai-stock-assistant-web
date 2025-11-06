import { useLocation } from 'react-router-dom';
import Routers from '@/router'
import NewHeader from '@/components/newheader/NewHeader';
import LeftNewNav from '@/components/leftnav/LeftNewNav';

/**
 * 主体
 */
const App = (props: any) => {
  const location = useLocation();
  const { pathname, hash } = location;
  const filterRouter = ['login'];
  const includesRouter = filterRouter.filter(v => {
    return pathname.includes(v);
  });
  console.log('App render')

  let appContent: any = null;
  if (includesRouter.length) {
    appContent = (
      <div className="pageMain t-FBH">
        <Routers />
      </div>
    );
  } else {
    appContent = (
      <div className="pageMain-wrap t-FBV">
        <NewHeader />
        <div className="pageMain t-FBH" style={{ top: '56px' }}>
          <LeftNewNav {...props} />
          <div className="main-content t-FB1 t-FBV">
            <Routers />
          </div>
        </div>
      </div>
    );
  }

  return appContent
}

export default App
