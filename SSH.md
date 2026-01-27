### ssh wyecshz 相关

### 将stock.conf上传至wyecshz
```bash
scp /Users/wangyang/project/ai-stock-assistant-web/stock.conf root@114.55.173.101:/etc/nginx/servers
```

## 发布

### 1.打包
```bash
npm run build
```

### 2.删除ecs上面的dist
```bash
rm -r /usr/code/ai-stock-assistant-web/dist
```

### 将dist上传至wyecshz
```bash
scp -r /Users/wangyang/project/ai-stock-assistant/ai-stock-assistant-web/dist root@114.55.173.101:/usr/code/ai-stock-assistant-web/
```