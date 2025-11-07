import './NewHeader.less'
import viteLogo from '@/images/svg/vite.svg'

const NewHeader = (props: any) => {
  return (
    <div className={'newheader t-FBH t-FBJ ' + props.themeClass}>
      <div className="logo t-FBH">
        <img src={viteLogo} alt="logo" />
        <span className="logo-text ml_20">AI STOCK ASSISTANT</span>
      </div>
      <div className="t-center-wrap"></div>
      <div className="header-info fs-14 t-FBH"></div>
    </div>
  )
}

export default NewHeader;