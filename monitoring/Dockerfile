# Use an official OpenJDK runtime as a parent image
FROM openjdk:21-ea-1-jdk

# Set the working directory in the container
WORKDIR /app

# Copy the packaged JAR file into the container
COPY target/rabbitmq-0.0.1-SNAPSHOT.jar app.jar

COPY .env .env

# Expose the port the application will run on
EXPOSE 8080

# Run the JAR file
ENTRYPOINT ["java", "--enable-preview", "-jar", "app.jar"]
