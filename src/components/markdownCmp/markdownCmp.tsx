import { marked } from 'marked';
import './markdownCmp.less';

const MarkDownCmp: React.FC<{content: string}> = ({
  content,
}) => {
  //   let _content = `
  // # Hi, *Pluto*!
  // I'm a helpful assistant designed to assist you with your questions and tasks. How can I assist you today?
  // ${content}`
  const _content = `${content}`;
  const markdownContent = (marked(_content) as string).trim()
  // .replace(/\n{2,}/g, '\n'); // 将3个及以上的连续换行替换为2个换行
  return (
    <div className="ai-message-item ai-markdown-content" dangerouslySetInnerHTML={{ __html: markdownContent }}></div>
  )
}

export default MarkDownCmp;