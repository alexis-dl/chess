FROM openjdk:17-oracle

# Set the working directory in the container
WORKDIR /app

COPY ./target/chess-api-0.0.1-SNAPSHOT.jar chess-api.jar

# Labels
# Refers to http://label-schema.org
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.author="Alexis Da Lage"

LABEL org.label-schema.name="chess-api"

ENTRYPOINT ["java","-jar","/app/chess-api.jar"]

