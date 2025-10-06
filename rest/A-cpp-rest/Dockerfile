FROM ubuntu:22.04


ENV DEBIAN_FRONTEND=noninteractive


RUN apt-get update && apt-get install -y g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app


COPY . .


RUN g++ -o servera servera_rest.cpp


EXPOSE 6001


CMD ["./servera"]
