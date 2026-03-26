# 直接使用Nginx镜像，无需Node构建阶段
FROM nginx:alpine
# 复制本地已打包的dist目录到Nginx
COPY dist/ /usr/share/nginx/html/
# 暴露80端口
EXPOSE 80
# 前台启动Nginx
CMD ["nginx", "-g", "daemon off;"]