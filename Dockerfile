FROM ubuntu:latest
RUN apt-get update && apt-get update -y
RUN apt-get install nginx -y
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
COPY ./ /usr/share/nginx/html
EXPOSE 80
